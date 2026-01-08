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
use DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Storage;
use Str;
use ZipArchive;


class BillingUserController extends Controller
{
    public function billingDashboard(Request $request)
    {
        $schoolYears = SchoolYear::orderByDesc('name')->get();
        $selectedSY = $request->input('school_year', $schoolYears->first()?->name);

        $paymentStats = BillingPayment::query()
            ->whereHas('enrollment.classArm.yearLevel.schoolYear', function ($q) use ($selectedSY) {
                $q->where('name', $selectedSY);
            })
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'payment_method' => $item->payment_method,
                    'total' => (float) $item->total,
                ];
            });

        $uniqueORCount = BillingPayment::whereHas('enrollment.classArm.yearLevel.schoolYear', function ($q) use ($selectedSY) {
            $q->where('name', $selectedSY);
        })->distinct('or_number')->count('or_number');

        $categoryTotals = DB::table('billing_payments')
            ->join('billings', 'billing_payments.billing_id', '=', 'billings.id')
            ->join('billing_cats', 'billings.billing_cat_id', '=', 'billing_cats.id')
            ->join('enrollments', 'billing_payments.enrollment_id', '=', 'enrollments.id')
            ->join('class_arms', 'enrollments.class_arm_id', '=', 'class_arms.id')
            ->join('year_levels', 'class_arms.year_level_id', '=', 'year_levels.id')
            ->join('school_years', 'year_levels.school_year_id', '=', 'school_years.id')
            ->where('school_years.name', $selectedSY)
            ->select('billing_cats.name as category', DB::raw('SUM(billing_payments.amount) as total'))
            ->groupBy('billing_cats.name')
            ->get();

        $today = Carbon::today();

        // 1. Summary by Payment Method
        $summaryByPaymentMethod = DB::table('billing_payments')
            ->whereDate('payment_date', $today)
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->get();

        // 2. Summary by Billing Category
        $summaryByCategory = DB::table('billing_payments')
            ->join('billings', 'billing_payments.billing_id', '=', 'billings.id')
            ->join('billing_cats', 'billings.billing_cat_id', '=', 'billing_cats.id')
            ->whereDate('billing_payments.payment_date', $today)
            ->select('billing_cats.name as category', DB::raw('SUM(billing_payments.amount) as total'))
            ->groupBy('billing_cats.name')
            ->get();

        $uniqueORCountToday = BillingPayment::whereDate('payment_date', $today)
            ->distinct('or_number')
            ->count('or_number');

        return Inertia::render('billing/billing-dashboard', [
            'paymentStats' => $paymentStats,
            'categoryTotals' => $categoryTotals,
            'uniqueORCount' => $uniqueORCount,
            'uniqueORCountToday' => $uniqueORCountToday,
            'schoolYears' => $schoolYears,
            'selectedSchoolYear' => $selectedSY,
            'summaryByPaymentMethod' => $summaryByPaymentMethod,
            'summaryByCategory' => $summaryByCategory,
        ]);
    }

    public function students(Request $request)
    {
        $schoolYears = SchoolYear::orderByDesc('name')->get();
        $selectedSY = $request->input('school_year', $schoolYears->first()?->name);

        $query = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'payments'
        ])
            ->whereHas('classArm.yearLevel.schoolYear', function ($q) use ($selectedSY) {
                $q->where('name', $selectedSY);
            });

        $students = $query->get()->map(function ($enrollment) {
            $totalPaid = $enrollment->payments ? $enrollment->payments->sum('amount') : 0;

            return [
                'id' => $enrollment->id,
                'lrn' => $enrollment->student->lrn,
                'firstName' => $enrollment->student->firstName,
                'middleName' => $enrollment->student->middleName,
                'lastName' => $enrollment->student->lastName,
                'yearLevel' => $enrollment->classArm->yearLevel->yearLevelName,
                'section' => $enrollment->classArm->classArmName,
                'totalPaid' => $totalPaid,
            ];
        });

        return Inertia::render('billing/billing-student-list', [
            'students' => $students,
            'schoolYears' => $schoolYears,
            'selectedSchoolYear' => $selectedSY,
        ]);
    }

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

        // Step 1: Group billings by category
        $billingByCategory = [];
        foreach ($billingItems as $billing) {
            $category = $billing->category->name;
            if (!isset($billingByCategory[$category])) {
                $billingByCategory[$category] = [
                    'category' => $category,
                    'totalBilling' => 0,
                    'billingDescriptions' => [],
                ];
            }

            $billingByCategory[$category]['totalBilling'] += (float) $billing->amount;
            $billingByCategory[$category]['billingDescriptions'][] = $billing->description ?? '—';
        }

        // Step 2: Group student discounts by category
        $discountByCategory = [];
        foreach ($studentDiscounts as $disc) {
            $category = $disc->category->name;
            if (!isset($discountByCategory[$category])) {
                $discountByCategory[$category] = [];
            }
            $discountByCategory[$category][] = $disc;
        }

        // Step 3: Group payments by category
        $paymentsByCategory = [];
        foreach ($payments as $payment) {
            $category = $payment->billing->category->name;
            if (!isset($paymentsByCategory[$category])) {
                $paymentsByCategory[$category] = 0;
            }
            $paymentsByCategory[$category] += (float) $payment->amount;
        }

        // Step 4: Prepare groupedSummary (category breakdown)
        $groupedSummary = [];
        foreach ($billingByCategory as $category => $data) {
            $totalBilling = $data['totalBilling'];
            $discounts = $discountByCategory[$category] ?? [];

            $totalDiscount = 0;
            $discountDescriptions = [];

            foreach ($discounts as $disc) {
                if ($disc->value === 'percentage') {
                    $amount = $totalBilling * ((float) $disc->amount / 100);
                    $totalDiscount += $amount;
                    $discountDescriptions[] = "{$disc->description} ({$disc->amount}%)";
                } else {
                    $amount = (float) $disc->amount;
                    $totalDiscount += $amount;
                    $discountDescriptions[] = "{$disc->description} (Php{$amount})";
                }
            }

            $totalAfterDiscount = max($totalBilling - $totalDiscount, 0);
            $paidAmount = $paymentsByCategory[$category] ?? 0;
            $remaining = max($totalAfterDiscount - $paidAmount, 0);

            $groupedSummary[] = [
                'category' => $category,
                'billingAmount' => $totalBilling,
                'discountAmount' => $totalDiscount,
                'discountDescriptions' => $discountDescriptions,
                'totalAfterDiscount' => $totalAfterDiscount,
                'billingDescriptions' => $data['billingDescriptions'],
                'paidAmount' => $paidAmount,
                'remaining' => $remaining,
            ];
        }

        // Step 5: Monthly SOA Table
        $soaMonths = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
        $currentMonthIndex = max(min(Carbon::now()->month - 6, 9), 0);

        $soaTableData = [];
        foreach ($groupedSummary as $item) {
            $category = $item['category'];
            $totalDue = $item['totalAfterDiscount'];

            // Get payments sorted chronologically by payment date
            $categoryPayments = $payments
                ->filter(fn($p) => $p->billing->category->name === $category)
                ->sortBy('payment_date')
                ->map(fn($p) => (float) $p->amount)
                ->values()
                ->toArray();

            $startMonthIndex = $category === 'BOOKS' ? 2 : 0;
            $monthCount = $category === 'BOOKS' ? 8 : 10;
            $perMonth = $monthCount > 0 ? $totalDue / $monthCount : 0;

            $monthStatus = array_fill(0, 10, ['paid' => 0, 'balance' => 0]);

            // Set fixed monthly balances
            for ($i = $startMonthIndex; $i < $startMonthIndex + $monthCount; $i++) {
                if ($i >= 10)
                    break;
                $monthStatus[$i]['balance'] = round($perMonth, 2);
            }

            // Distribute payments to months
            $remainingPayments = $categoryPayments;
            for ($i = 0; $i < 10; $i++) {
                $expected = $monthStatus[$i]['balance'];
                $paid = 0;

                while (!empty($remainingPayments) && $paid < $expected) {
                    $toApply = min($expected - $paid, $remainingPayments[0]);
                    $paid += $toApply;
                    $remainingPayments[0] -= $toApply;

                    if ($remainingPayments[0] <= 0) {
                        array_shift($remainingPayments);
                    }
                }

                $monthStatus[$i]['paid'] = round($paid, 2);
                $monthStatus[$i]['balance'] = round(max($expected - $paid, 0), 2);
            }

            $soaTableData[] = [
                'category' => $category,
                'monthlyStatus' => $monthStatus,
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

    public function studentDetail(string $id)
    {
        $enrollment = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'billingItems' => fn($q) => $q->with('category'),
            'billingDiscounts.category',
            'payments.billing.category',
        ])->findOrFail($id);

        $schoolYearId = optional($enrollment->classArm?->yearLevel?->schoolYear)?->id;

        $availableDiscounts = BillingDisc::with('category')
            ->where('school_year_id', $schoolYearId)
            ->get();

        $yearLevelId = $enrollment->classArm->yearLevel->id;

        $availableBillings = Billing::with('category')
            ->where('year_level_id', $yearLevelId)
            ->get();

        $sameSchoolYearEnrollments = Enrollment::with('student')
            ->whereHas('classArm.yearLevel.schoolYear', function ($query) use ($schoolYearId) {
                $query->where('id', $schoolYearId);
            })
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'lrn' => $enrollment->student->lrn,
                    'firstName' => $enrollment->student->firstName,
                    'middleName' => $enrollment->student->middleName,
                    'lastName' => $enrollment->student->lastName,
                ];
            });

        return Inertia::render('billing/billing-student-details', [
            'enrollment' => $enrollment,
            'availableDiscounts' => $availableDiscounts,
            'availableBillings' => $availableBillings,
            'sameSchoolYearEnrollments' => $sameSchoolYearEnrollments,
        ]);
    }

    public function generateStudentBillingPDF(string $id)
    {
        $enrollment = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'billingItems.category',
            'billingDiscounts.category',
            'payments.billing.category',
        ])->findOrFail($id);

        $months = collect(range(6, 12))->merge(range(1, 5))->map(function ($m) {
            return [
                'value' => $m,
                'label' => Carbon::create()->month($m)->format('F'),
            ];
        });

        $currentMonth = Carbon::now()->month;
        $totalDueThisMonth = 0;
        $installments = [];

        foreach ($enrollment->billingItems as $item) {
            $pivot = $item->pivot;
            if (!$pivot->month_installment || !$pivot->start_month || !$pivot->end_month)
                continue;

            $category = $item->category->name ?? '—';
            $qty = $pivot->quantity ?? 1;
            $rawAmount = floatval($item->amount) * $qty;

            $matchingDiscounts = $enrollment->billingDiscounts->filter(fn($d) => $d->category->name === $category);
            $discountTotal = 0;

            foreach ($matchingDiscounts as $disc) {
                if ($disc->value === 'fixed') {
                    $discountTotal += floatval($disc->amount);
                } elseif ($disc->value === 'percentage') {
                    $discountTotal += ($rawAmount * floatval($disc->amount) / 100);
                }
            }

            $totalAmount = $rawAmount - $discountTotal;

            // ✅ Get down payment
            $downPayment = $enrollment->payments
                ->filter(fn($p) => $p->billing?->category?->name === $category && $p->remarks === 'down_payment')
                ->sum(fn($p) => floatval($p->amount));

            $installmentBalance = max($totalAmount - $downPayment, 0);
            $monthlyBase = $installmentBalance / $pivot->month_installment;


            $installmentMonths = [];
            for ($i = 0; $i < $pivot->month_installment; $i++) {
                $installmentMonths[] = (($pivot->start_month - 1 + $i) % 12) + 1;
            }

            $itemPayments = $enrollment->payments
                ->filter(
                    fn($p) =>
                    $p->billing?->category?->name === $category &&
                    $p->remarks !== 'down_payment'
                )
                ->sortBy('payment_date');


            $totalPaid = $itemPayments->sum(fn($p) => floatval($p->amount));
            $carryOver = 0;
            $installmentMap = [];

            foreach ($installmentMonths as $month) {
                $due = $monthlyBase + $carryOver;
                $paid = min($due, $totalPaid);
                $totalPaid -= $paid;
                $balance = $due - $paid;
                $carryOver = $balance;
                $installmentMap[$month] = [
                    'due' => round($due, 2),
                    'balance' => round($balance, 2),
                ];
            }

            // Handle current month's due
            if (isset($installmentMap[$currentMonth])) {
                $totalDueThisMonth += $installmentMap[$currentMonth]['balance'];
            } else {
                // Carry over last unpaid balance if installment already ended
                $monthsSorted = array_keys($installmentMap);
                sort($monthsSorted);

                $lastMonth = end($monthsSorted);

                if ($currentMonth > $lastMonth) {
                    $totalDueThisMonth += $installmentMap[$lastMonth]['balance'] ?? 0;
                }
            }
            
            $installments[] = [
                'category' => $category,
                'months' => $installmentMap,
                'installment_count' => $pivot->month_installment,
                'down_payment' => $downPayment,
            ];
        }

        $pdf = Pdf::loadView('pdf.student-billing', [
            'enrollment' => $enrollment,
            'student' => $enrollment->student,
            'months' => $months,
            'installments' => $installments,
            'currentMonth' => $currentMonth,
            'totalDueThisMonth' => $totalDueThisMonth,
        ])->setPaper('letter', 'portrait');

        return $pdf->stream("billing-summary-{$enrollment->student->lastName}.pdf");
    }
}
