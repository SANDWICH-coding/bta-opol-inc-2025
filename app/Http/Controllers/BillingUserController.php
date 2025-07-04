<?php

namespace App\Http\Controllers;
use App\Models\Billing;
use App\Models\BillingCat;
use App\Models\BillingDisc;
use App\Models\BillingPayment;
use App\Models\Enrollment;
use App\Models\SchoolYear;
use App\Models\SoaFile;
use App\Models\Student;
use App\Models\YearLevel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Storage;

class BillingUserController extends Controller
{
    public function listSchoolYear()
    {
        $schoolYears = SchoolYear::withCount('yearLevels')->get();

        $payments = BillingPayment::with(['enrollment.student'])
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(function ($payment) {
                // group by OR number + created_at DATE only
                return $payment->or_number . '|' . $payment->created_at->format('Y-m-d');
            })
            ->map(function ($grouped) {
                $first = $grouped->first();

                return [
                    'orNumber' => $first->or_number,
                    'amount' => $grouped->sum('amount'),
                    'paymentDate' => $first->payment_date,
                    'createdAt' => $first->created_at,
                    'student' => [
                        'firstName' => $first->enrollment->student->firstName,
                        'lastName' => $first->enrollment->student->lastName,
                        'profilePhoto' => $first->enrollment->student->profilePhoto,
                    ],
                ];
            })
            ->sortByDesc('createdAt') // ensure sorted after mapping
            ->values()
            ->take(10);

        return Inertia::render('billing/billing-school-year', [
            'schoolYears' => $schoolYears,
            'recentPayments' => $payments,
        ]);
    }

    public function listYearLevel(string $id)
    {
        $schoolYear = SchoolYear::with([
            'yearLevels.classArms.enrollments.student',
            'yearLevels.billings.category',
            'billingDiscounts.category',
        ])->findOrFail($id);

        $studentOptions = collect();

        // Gather all enrollments under this school year
        $enrollmentIds = $schoolYear->yearLevels->flatMap(function ($level) {
            return $level->classArms->flatMap(function ($arm) {
                return $arm->enrollments->pluck('id');
            });
        });

        // Get all billing_payments linked to these enrollments
        $allPayments = BillingPayment::with(['billing.category'])
            ->whereIn('enrollment_id', $enrollmentIds)
            ->get();

        // Today's date
        $today = Carbon::today('Asia/Manila')->toDateString();

        // Filter today's transactions
        $todaysPayments = $allPayments->where('payment_date', $today);

        // Today's summary (unchanged)
        $overview = [
            'or_issued' => $todaysPayments->pluck('or_number')->unique()->count(),
            'total' => $todaysPayments->sum('amount'),
            'cash' => $todaysPayments->where('payment_method', 'cash')->sum('amount'),
            'gcash' => $todaysPayments->where('payment_method', 'gcash')->sum('amount'),
            'bank_transfer' => $todaysPayments->where('payment_method', 'bank_transfer')->sum('amount'),
            'check' => $todaysPayments->where('payment_method', 'check')->sum('amount'),
        ];

        // ✅ OVERALL summary for the selected school year
        $overall = [
            'or_issued' => $allPayments->pluck('or_number')->unique()->count(),
            'total' => $allPayments->sum('amount'),
            'cash' => $allPayments->where('payment_method', 'cash')->sum('amount'),
            'gcash' => $allPayments->where('payment_method', 'gcash')->sum('amount'),
            'bank_transfer' => $allPayments->where('payment_method', 'bank_transfer')->sum('amount'),
            'check' => $allPayments->where('payment_method', 'check')->sum('amount'),
        ];

        $schoolYear->yearLevels->each(function ($level) use (&$studentOptions) {
            $enrollments = $level->classArms->flatMap(function ($arm) {
                return $arm->enrollments;
            });

            $level->student_count = $enrollments->pluck('student_id')->unique()->count();

            $studentOptions = $studentOptions->merge(
                $enrollments->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->student->id,
                        'label' => "{$enrollment->student->lastName}, {$enrollment->student->firstName}",
                        'value' => (string) $enrollment->student->id,
                        'route' => "/billing/student/{$enrollment->id}",
                        'avatar' => $enrollment->student->profilePhoto,
                        'badge' => $enrollment->classArm->yearLevel->yearLevelName,
                    ];
                })
            );
        });

        $uniqueStudents = $studentOptions
            ->unique('route')
            ->sortBy('label')
            ->values();

        $billingCategories = BillingCat::all(['id', 'name']);

        return Inertia::render('billing/billing-year-level-list', [
            'schoolYear' => $schoolYear,
            'billingCategories' => $billingCategories,
            'students' => $uniqueStudents,
            'allPayments' => $allPayments,
            'overview' => $overview,
            'overall' => $overall, // ✅ return this to frontend
        ]);
    }

    public function listStudent(string $id)
    {
        $students = Student::whereHas('enrollments.classArm.yearLevel', function ($query) use ($id) {
            $query->where('id', $id);
        })
            ->with(['enrollments.classArm.yearLevel.schoolYear'])
            ->get();

        $yearLevel = YearLevel::with('schoolYear')->findOrFail($id);
        $schoolYear = $yearLevel->schoolYear;

        return Inertia::render('billing/billing-student-list', [
            'students' => $students,
            'schoolYear' => [
                'id' => $schoolYear->id,
                'name' => $schoolYear->name,
            ],
        ]);
    }

    public function studentDetails(string $id)
    {
        $enrollment = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'classArm.yearLevel.billings.category',
            'billingDiscounts.category',
            'payments.billing.category',
            'soaFiles',
        ])->findOrFail($id);

        $yearLevelId = $enrollment->classArm->yearLevel->id;
        $schoolYearId = $enrollment->classArm->yearLevel->schoolYear->id;

        // Fetch all billing discounts available for this school year
        $availableDiscounts = BillingDisc::with('category')
            ->where('school_year_id', $schoolYearId)
            ->get();

        // Fetch all billing items assigned to this year level for the current school year
        $billingItems = Billing::with('category')
            ->where('year_level_id', $yearLevelId)
            ->get();

        return Inertia::render('billing/billing-student-details', [
            'enrollment' => $enrollment,
            'availableDiscounts' => $availableDiscounts,
            'paymentHistory' => $enrollment->payments,
            'billingItems' => $billingItems,
            'soaFiles' => $enrollment->soaFiles,
        ]);
    }

    protected function getPaymentForMonth($payments, $category, $monthIndex)
    {
        $month = $monthIndex + 6; // June = 6
        return $payments
            ->filter(
                fn($p) =>
                $p->billing->category->name === $category &&
                Carbon::parse($p->payment_date)->month === $month
            )
            ->sum(fn($p) => (float) $p->amount);
    }

    protected function prepareStatementData($enrollment, $billingItems, $studentDiscounts)
    {
        $studentDiscounts = $studentDiscounts ?? collect();
        $payments = $enrollment->payments ?? collect();

        $grouped = [];

        foreach ($billingItems as $billing) {
            $category = $billing->category->name;
            $billingAmount = (float) $billing->amount;

            if (!isset($grouped[$category])) {
                $grouped[$category] = [
                    'category' => $category,
                    'billingAmount' => 0,
                    'discountDescriptions' => [],
                    'totalAfterDiscount' => 0,
                    'paidAmount' => 0,
                    'remaining' => 0,
                ];
            }

            $grouped[$category]['billingAmount'] += $billingAmount;

            // Get matching discounts for this category
            $discounts = $studentDiscounts->filter(fn($d) => $d->category->name === $category);

            $totalDiscount = 0;
            foreach ($discounts as $disc) {
                $amount = $disc->value === 'percentage'
                    ? ($billingAmount * ((float) $disc->amount / 100))
                    : (float) $disc->amount;

                $grouped[$category]['discountDescriptions'][] = [
                    'description' => $disc->description,
                    'amount' => $amount,
                ];

                $totalDiscount += $amount;
            }

            $netAmount = max($billingAmount - $totalDiscount, 0);
            $grouped[$category]['totalAfterDiscount'] += $netAmount;

            $paidAmount = $payments
                ->filter(fn($p) => $p->billing->category->name === $category)
                ->sum(fn($p) => (float) $p->amount);

            $grouped[$category]['paidAmount'] += $paidAmount;
            $grouped[$category]['remaining'] = $grouped[$category]['totalAfterDiscount'] - $grouped[$category]['paidAmount'];
        }

        $groupedSummary = array_values($grouped);
        $soaMonths = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
        $currentMonthIndex = max(min(Carbon::now()->month - 6, 9), 0);

        $soaTableData = [];

        foreach ($grouped as $category => $summary) {
            $monthlyStatus = [];

            $remaining = $summary['remaining'];
            $deferStartMonth = $category === 'BOOKS' ? 2 : 0;
            $numMonths = 10 - $deferStartMonth;
            $monthlyBalance = $numMonths > 0 ? round($remaining / $numMonths, 2) : 0;

            for ($i = 0; $i < 10; $i++) {
                $monthPaid = $this->getPaymentForMonth($payments, $category, $i);
                $balance = $i >= $deferStartMonth ? $monthlyBalance : 0;

                $monthlyStatus[] = [
                    'paid' => $monthPaid,
                    'balance' => max(0, $balance - $monthPaid),
                ];
            }

            $soaTableData[] = [
                'category' => $category,
                'monthlyStatus' => $monthlyStatus,
            ];
        }

        return [
            'groupedSummary' => $groupedSummary,
            'soaTableData' => $soaTableData,
            'soaMonths' => $soaMonths,
            'currentMonthIndex' => $currentMonthIndex,
            'totalPaid' => array_sum(array_column($groupedSummary, 'paidAmount')),
            'remainingBalance' => array_sum(array_column($groupedSummary, 'remaining')),
        ];
    }

    public function generateSoa($enrollmentId)
    {
        $enrollment = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'classArm.yearLevel.billings.category',
            'billingDiscounts.category',
            'payments.billing.category',
        ])->findOrFail($enrollmentId);

        $soaData = $this->prepareStatementData(
            $enrollment,
            $enrollment->classArm->yearLevel->billings,
            $enrollment->billingDiscounts
        );

        $pdf = Pdf::loadView('pdf.statement-of-account', [
            'enrollment' => $enrollment,
            'groupedSummary' => $soaData['groupedSummary'],
            'soaTableData' => $soaData['soaTableData'],
            'soaMonths' => $soaData['soaMonths'],
            'currentMonthIndex' => $soaData['currentMonthIndex'],
            'totalPaid' => $soaData['totalPaid'],
            'remainingBalance' => $soaData['remainingBalance'],
        ])->setPaper('legal', 'portrait');

        $filePath = $pdf->output();
        $filename = "SOA-{$enrollment->student->lastName}-{$enrollment->student->firstName}-" . now()->format('YmdHis') . ".pdf";


        // Save to public disk
        $storedPath = Storage::disk('public')->put("soa_files/{$filename}", $filePath);

        // Save relative path to DB
        SoaFile::create([
            'enrollment_id' => $enrollment->id,
            'file_path' => "soa_files/{$filename}", // this is what you store
            'file_name' => $filename,
            'generated_at' => now(),
        ]);

        return response()->download(Storage::disk('public')->path("soa_files/{$filename}"));
    }

}
