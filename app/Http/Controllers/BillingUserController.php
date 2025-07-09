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
use Str;
use ZipArchive;

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

        $fileContent = $pdf->output();
        $filename = "SOA-{$enrollment->student->lastName}-{$enrollment->student->firstName}-" . now()->format('YmdHis') . ".pdf";

        // Step 1: Store to Laravel public storage
        Storage::disk('public')->put("soa_files/{$filename}", $fileContent);

        // Step 2: Save path to DB
        SoaFile::create([
            'enrollment_id' => $enrollment->id,
            'file_path' => "soa_files/{$filename}",
            'file_name' => $filename,
            'generated_at' => now(),
        ]);

        // Step 3: Save locally to Desktop/<Month>/<YearLevel>/<ClassArm>/PDF
        $home = $_SERVER['HOME'] ?? getenv('HOME'); // UNIX/macOS/Linux
        $desktopPath = rtrim($home, '\\/') . DIRECTORY_SEPARATOR . 'Desktop';
        $monthFolder = Carbon::now()->format('F'); // e.g., July

        $yearLevelName = $enrollment->classArm->yearLevel->yearLevelName ?? 'YearLevel';
        $classArmName = $enrollment->classArm->classArmName ?? 'ClassArm';

        // Sanitize folder names
        $yearLevelName = trim(preg_replace('/[^A-Za-z0-9_\- ]/', '', $yearLevelName));
        $classArmName = trim(preg_replace('/[^A-Za-z0-9_\- ]/', '', $classArmName));

        // Full folder path
        $localFolderPath = $desktopPath . DIRECTORY_SEPARATOR .
            $monthFolder . DIRECTORY_SEPARATOR .
            $yearLevelName . DIRECTORY_SEPARATOR .
            $classArmName;

        // Create directory if not exists
        if (!is_dir($localFolderPath)) {
            mkdir($localFolderPath, 0777, true);
        }

        $localFilePath = $localFolderPath . DIRECTORY_SEPARATOR . $filename;
        file_put_contents($localFilePath, $fileContent);

        // Response
        return response()->json([
            'message' => 'SOA has been saved to Desktop successfully.',
            'local_path' => $localFilePath,
            'storage_path' => "soa_files/{$filename}",
        ]);
    }

    public function generateAllSoa($schoolYearId)
    {
        $enrollments = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'classArm.yearLevel.billings.category',
            'billingDiscounts.category',
            'payments.billing.category',
        ])
            ->whereHas('classArm.yearLevel.schoolYear', fn($q) => $q->where('id', $schoolYearId))
            ->get();

        if ($enrollments->isEmpty()) {
            return response()->json(['message' => 'No enrollments found.'], 404);
        }

        $results = [];
        $timestampFolder = Carbon::now()->format('F-Y_d-H-i-s'); // e.g. July-2025_05-14-22

        foreach ($enrollments as $enrollment) {
            $studentName = "{$enrollment->student->firstName} {$enrollment->student->lastName}";

            try {
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

                $fileContent = $pdf->output();
                $filename = "SOA-{$enrollment->student->lastName}-{$enrollment->student->firstName}.pdf";

                $yearLevelName = preg_replace('/[^A-Za-z0-9_\- ]/', '', $enrollment->classArm->yearLevel->yearLevelName ?? 'YearLevel');
                $classArmName = preg_replace('/[^A-Za-z0-9_\- ]/', '', $enrollment->classArm->classArmName ?? 'ClassArm');

                $storagePath = "soa_files/{$timestampFolder}/{$yearLevelName}/{$classArmName}/{$filename}";

                Storage::disk('public')->put($storagePath, $fileContent);

                SoaFile::create([
                    'enrollment_id' => $enrollment->id,
                    'file_path' => $storagePath,
                    'file_name' => $filename,
                    'generated_at' => now(),
                ]);

                $results[] = ['student' => $studentName, 'status' => 'success'];
            } catch (\Throwable $e) {
                $results[] = ['student' => $studentName, 'status' => 'error', 'message' => $e->getMessage()];
            }

            usleep(150000); // small delay
        }

        return response()->json([
            'message' => 'SOA generation complete.',
            'results' => $results,
        ]);
    }


    public function downloadSoaZip($schoolYearId)
    {
        $soaFiles = SoaFile::whereHas(
            'enrollment.classArm.yearLevel.schoolYear',
            fn($q) =>
            $q->where('id', $schoolYearId)
        )->get();

        if ($soaFiles->isEmpty()) {
            return response()->json(['message' => 'No SOA files available for this school year.'], 404);
        }

        $zipFileName = "SOA_{$schoolYearId}_" . now()->format('Ymd_His') . ".zip";
        $tempZipPath = storage_path("app/temp/{$zipFileName}");

        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($soaFiles as $file) {
                $fullPath = storage_path("app/public/{$file->file_path}");

                if (file_exists($fullPath)) {
                    $relativePath = $file->file_name;
                    $zip->addFile($fullPath, $relativePath);
                }
            }

            $zip->close();
        } else {
            return response()->json(['message' => 'Failed to create ZIP file.'], 500);
        }

        return response()->download($tempZipPath)->deleteFileAfterSend(true);
    }

}
