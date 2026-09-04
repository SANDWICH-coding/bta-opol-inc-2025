<?php

namespace App\Http\Controllers;

use App\Models\BillingCat;
use App\Models\BillingDisc;
use App\Models\ClassArm;
use Illuminate\Support\Facades\Storage;
use App\Models\Enrollment;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EnrollmentController extends Controller
{
public function schoolYearList()
{
    $schoolYears = SchoolYear::query()
        ->withCount('yearLevels')
        ->get();

    return Inertia::render('registrar/enrollment-sy', [
        'schoolYears' => $schoolYears,
    ]);
}




    public function schoolYearSetup(string $id)
    {
        $schoolYear = SchoolYear::with([
            'yearLevels.classArms',
            'yearLevels.billings.category',
            'billingDiscounts.category',
        ])->findOrFail($id);

        $billingCategories = BillingCat::all(['id', 'name']);

        return Inertia::render('registrar/enrollment-sy-setup', [
            'schoolYear' => $schoolYear,
            'billingCategories' => $billingCategories,
        ]);
    }

    public function classArmSetup(string $id)
    {
        $classArm = ClassArm::with(['enrollments.student', 'yearLevel.schoolYear'])->findOrFail($id);

        $students = $classArm->enrollments->pluck('student')->filter()->values();

        $yearLevel = $classArm->yearLevel;

        if (!$yearLevel || !$yearLevel->schoolYear) {
            abort(404, 'School year data is incomplete.');
        }

        $schoolYear = $yearLevel->schoolYear;

        $billingDiscounts = BillingDisc::where('school_year_id', $schoolYear->id)
            ->with('category')
            ->get();

        return Inertia::render('registrar/enrollment-class-list', [
            'classArm' => $classArm,
            'students' => $students,
            'schoolYear' => $schoolYear,
            'yearLevel' => $yearLevel,
            'billingDiscounts' => $billingDiscounts,
        ]);
    }

    public function enrollStudent(Request $request)
    {
        $validated = $request->validate([
            'class_arm_id' => 'required|exists:class_arms,id',
            'type' => 'required|in:new,transferee,old/continuing',
            'lrn' => 'nullable|string|max:20',
            'lastName' => 'required|string|max:100',
            'firstName' => 'required|string|max:100',
            'middleName' => 'nullable|string|max:100',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'required|in:male,female',
        ]);

        $student = Student::create([
            'lrn' => $validated['lrn'] ?? null,
            'lastName' => $validated['lastName'],
            'firstName' => $validated['firstName'],
            'middleName' => $validated['middleName'] ?? null,
            'suffix' => $validated['suffix'] ?? null,
            'gender' => $validated['gender'],
        ]);

        $enrollment = Enrollment::create([
            'type' => $validated['type'],
            'class_arm_id' => $validated['class_arm_id'],
            'student_id' => $student->id,
        ]);

        return redirect()->back()->with('success', 'Student enrolled successfully.');
    }
    public function studentEnrollmentDetails(string $id)
    {
        $student = Student::with([
            'enrollments.classArm.yearLevel.schoolYear',
        ])->findOrFail($id);

        return Inertia::render('registrar/enrollment-student-details', [
            'student' => $student,
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $student = Student::findOrFail($id);

        if ($student->profilePhoto && Storage::disk('public')->exists($student->profilePhoto)) {
            Storage::disk('public')->delete($student->profilePhoto);
        }

        $path = $request->file('photo')->store('profile-photos', 'public');
        $student->profilePhoto = $path;
        $student->save();

        return back()->with('success', 'Profile photo updated successfully.');
    }

    public function updateBirthDate(Request $request, $id)
    {
        $validated = $request->validate([
            'birthDate' => 'required|date',
        ]);

        $student = Student::findOrFail($id);
        $student->birthDate = $validated['birthDate'];
        $student->save();

        return back()->with('success', 'Birth date updated successfully.');
    }

    public function studentListActiveSchoolYear()
    {
        $activeSchoolYear = SchoolYear::where('is_active', true)->first();

        if (!$activeSchoolYear) {
            abort(404, 'No active school year found.');
        }

        // Fetch year levels with their students (via enrollments)
        $yearLevels = YearLevel::with([
            'classArms.enrollments.student',
        ])
            ->where('school_year_id', $activeSchoolYear->id)
            ->get()
            ->map(function ($yearLevel) {
                // Collect students from class arms
                $students = collect();
                foreach ($yearLevel->classArms as $classArm) {
                    foreach ($classArm->enrollments as $enrollment) {
                        $student = $enrollment->student;
                        $students->push([
                            'id' => $student->id,
                            'lrn' => $student->lrn,
                            'firstName' => $student->firstName,
                            'lastName' => $student->lastName,
                            'middleName' => $student->middleName,
                            'suffix' => $student->suffix,
                            'gender' => $student->gender,
                            'enrollment_id' => $enrollment->id,
                        ]);
                    }
                }

                return [
                    'id' => $yearLevel->id,
                    'yearLevelName' => $yearLevel->yearLevelName,
                    'students' => $students->unique('id')->values(),
                ];
            });

        return Inertia::render('billing/billing-enrollment-list', [
            'activeSchoolYear' => [
                'id' => $activeSchoolYear->id,
                'name' => $activeSchoolYear->name,
            ],
            'yearLevels' => $yearLevels,
        ]);
    }


    public function studentBillingDetails(string $id)
    {
        $enrollment = Enrollment::with([
            'student',
            'classArm.yearLevel.schoolYear',
            'billingDiscounts.billingDisc.category',
        ])->findOrFail($id);

        return Inertia::render('billing/billing-student-mng', [
            'enrollment' => [
                'id' => $enrollment->id,
                'type' => $enrollment->type,
                'student' => $enrollment->student,
                'schoolYear' => $enrollment->classArm->yearLevel->schoolYear,
                'yearLevel' => $enrollment->classArm->yearLevel,
                'billingDiscounts' => $enrollment->billingDiscounts->map(function ($discount) {
                    return [
                        'id' => $discount->id,
                        'billing_disc' => [
                            'id' => $discount->billingDisc->id,
                            'value' => $discount->billingDisc->value,
                            'amount' => $discount->billingDisc->amount,
                            'description' => $discount->billingDisc->description,
                            'category' => $discount->billingDisc->category,
                        ],
                    ];
                }),
            ],
        ]);
    }


    public function enrollmentAnalytics(Request $request)
    {
        // Optional filter: ?school_year_id=xxx
        $selectedSchoolYearId = $request->integer('school_year_id') ?: null;

        // -------------------------------------------------
        // 1. Base query with all necessary joins
        // -------------------------------------------------
        $base = Enrollment::query()
            ->join('class_arms', 'enrollments.class_arm_id', '=', 'class_arms.id')
            ->join('year_levels', 'class_arms.year_level_id', '=', 'year_levels.id')
            ->join('school_years', 'year_levels.school_year_id', '=', 'school_years.id')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->select([
                'enrollments.*',
                'school_years.id as school_year_id',
                'school_years.name as school_year_name',
                'year_levels.id as year_level_id',
                'year_levels.yearLevelName as year_level_name',
                'class_arms.id as class_arm_id',
                'class_arms.classArmName as class_arm_name',
                'students.gender',
            ]);

        if ($selectedSchoolYearId) {
            $base->where('school_years.id', $selectedSchoolYearId);
        }

        // -------------------------------------------------
        // 2. Totals by School Year (comparison)
        // -------------------------------------------------
        $bySchoolYear = (clone $base)
            ->select(
                'school_years.id',
                'school_years.name',
                'school_years.is_active',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN enrollments.type = 'new' THEN 1 ELSE 0 END) as new_count"),
                DB::raw("SUM(CASE WHEN enrollments.type = 'transferee' THEN 1 ELSE 0 END) as transferee_count"),
                DB::raw("SUM(CASE WHEN enrollments.type = 'old/continuing' THEN 1 ELSE 0 END) as continuing_count"),
                DB::raw("SUM(CASE WHEN students.gender = 'male' THEN 1 ELSE 0 END) as male_count"),
                DB::raw("SUM(CASE WHEN students.gender = 'female' THEN 1 ELSE 0 END) as female_count")
            )
            ->groupBy('school_years.id', 'school_years.name', 'school_years.is_active')
            ->orderBy('school_years.name')
            ->get();

        // -------------------------------------------------
        // 3. Enrollment type distribution (overall + filtered)
        // -------------------------------------------------
        $typeDistribution = (clone $base)
            ->select('enrollments.type', DB::raw('COUNT(*) as total'))
            ->groupBy('enrollments.type')
            ->pluck('total', 'type');

        // -------------------------------------------------
        // 4. Gender distribution
        // -------------------------------------------------
        $genderDistribution = (clone $base)
            ->select('students.gender', DB::raw('COUNT(*) as total'))
            ->groupBy('students.gender')
            ->pluck('total', 'gender');

        // -------------------------------------------------
        // 5. Year Level growth across school years
        // -------------------------------------------------
        $yearLevelGrowth = (clone $base)
            ->select(
                'year_levels.yearLevelName',
                'school_years.name as school_year',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('year_levels.yearLevelName', 'school_years.name')
            ->orderBy('year_levels.yearLevelName')
            ->orderBy('school_years.name')
            ->get()
            ->groupBy('yearLevelName');   // ready for charts

        // -------------------------------------------------
        // 6. Per Year Level inside a school year (when filtered)
        // -------------------------------------------------
        $byYearLevel = null;
        if ($selectedSchoolYearId) {
            $byYearLevel = (clone $base)
                ->select(
                    'year_levels.id',
                    'year_levels.yearLevelName',
                    DB::raw('COUNT(*) as total'),
                    DB::raw("SUM(CASE WHEN enrollments.type = 'new' THEN 1 ELSE 0 END) as new_count"),
                    DB::raw("SUM(CASE WHEN enrollments.type = 'transferee' THEN 1 ELSE 0 END) as transferee_count"),
                    DB::raw("SUM(CASE WHEN enrollments.type = 'old/continuing' THEN 1 ELSE 0 END) as continuing_count"),
                    DB::raw("SUM(CASE WHEN students.gender = 'male' THEN 1 ELSE 0 END) as male_count"),
                    DB::raw("SUM(CASE WHEN students.gender = 'female' THEN 1 ELSE 0 END) as female_count")
                )
                ->groupBy('year_levels.id', 'year_levels.yearLevelName')
                ->orderBy('year_levels.yearLevelName')
                ->get();
        }

        // -------------------------------------------------
        // 7. Class Arm occupancy (optional but useful)
        // -------------------------------------------------
        $byClassArm = null;
        if ($selectedSchoolYearId) {
            $byClassArm = (clone $base)
                ->select(
                    'class_arms.id',
                    'class_arms.classArmName',
                    'year_levels.yearLevelName',
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('class_arms.id', 'class_arms.classArmName', 'year_levels.yearLevelName')
                ->orderBy('year_levels.yearLevelName')
                ->orderBy('class_arms.classArmName')
                ->get();
        }

        // -------------------------------------------------
        // 8. Summary cards
        // -------------------------------------------------
        $summary = [
            'total_enrollments'   => (clone $base)->count(),
            'new'                 => $typeDistribution['new'] ?? 0,
            'transferee'          => $typeDistribution['transferee'] ?? 0,
            'continuing'          => $typeDistribution['old/continuing'] ?? 0,
            'male'                => $genderDistribution['male'] ?? 0,
            'female'              => $genderDistribution['female'] ?? 0,
        ];

        // -------------------------------------------------
        // School years for the filter dropdown
        // -------------------------------------------------
        $schoolYears = SchoolYear::orderBy('name')->get(['id', 'name', 'is_active']);

        return Inertia::render('registrar/enrollment-analytics', [
            'summary'            => $summary,
            'bySchoolYear'       => $bySchoolYear,
            'typeDistribution'   => $typeDistribution,
            'genderDistribution' => $genderDistribution,
            'yearLevelGrowth'    => $yearLevelGrowth,
            'byYearLevel'        => $byYearLevel,
            'byClassArm'         => $byClassArm,
            'schoolYears'        => $schoolYears,
            'filters'            => [
                'school_year_id' => $selectedSchoolYearId,
            ],
        ]);
    }

}
