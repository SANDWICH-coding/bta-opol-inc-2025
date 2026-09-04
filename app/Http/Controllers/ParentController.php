<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\BillingItem;
use App\Models\BillingDiscount;
use App\Models\Payment;

class ParentController extends Controller
{
    public function index()
    {
        $parent = Auth::user();

        $students = $parent->students()
            ->select([
                'students.id',
                'students.lrn',
                'students.lastName',
                'students.firstName',
                'students.middleName',
                'students.suffix',
            ])
            ->with([
                'enrollments' => function ($query) {
                    $query
                        ->select([
                            'id',
                            'student_id',
                            'class_arm_id',
                            'type',
                            'created_at',
                            'updated_at',
                        ])
                        ->with([
                            'classArm:id,year_level_id,classArmName',
                            'classArm.yearLevel:id,school_year_id,yearLevelName',
                            'classArm.yearLevel.schoolYear:id,name',
                        ])
                        ->latest('created_at');
                },
            ])
            ->orderBy('lastName')
            ->orderBy('firstName')
            ->get();

        return Inertia::render('parent/index', [
            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
            ],
            'students' => $students,
        ]);
    }

    public function show(string $enrollmentId)
{
    $enrollment = Enrollment::with([
        'student',
        'classArm.yearLevel.schoolYear',
        'billingItems.category',
        'billingDiscounts.category',
        'payments.billing.category',
        'soaFiles',
    ])->findOrFail($enrollmentId);

    $parent = Auth::user();

    // Explicitly specify the table to avoid ambiguous column
    $studentIds = $parent->students()->pluck('students.id');

    if (!$studentIds->contains($enrollment->student_id)) {
        abort(403);
    }

    return Inertia::render('parent/student-billing-details', [
        'enrollment' => $enrollment,
    ]);
}
}