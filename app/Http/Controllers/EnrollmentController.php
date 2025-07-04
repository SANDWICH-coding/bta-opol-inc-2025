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

class EnrollmentController extends Controller
{
    public function schoolYearList()
    {
        $schoolYears = SchoolYear::all();

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

}
