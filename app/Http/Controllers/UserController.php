<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Student;

class UserController extends Controller
{
public function index()
{
    $users = User::query()
        ->select([
            'id',
            'name',
            'email',
            'email_verified_at',
            'role',
            'created_at',
            'updated_at',
        ])
        ->whereIn('role', [
            'user',
            'parent',
        ])
        ->with([
            'students' => function ($query) {
                $query->select([
                    'students.id',
                    'students.lrn',
                    'students.lastName',
                    'students.firstName',
                    'students.middleName',
                    'students.suffix',
                ])
                ->with([
                    'enrollments' => function ($enrollmentQuery) {
                        $enrollmentQuery->select([
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
                        ]);
                    },
                ]);
            },
        ])
        ->latest()
        ->get();

    $students = \App\Models\Student::query()
        ->select([
            'id',
            'lrn',
            'lastName',
            'firstName',
            'middleName',
            'suffix',
        ])
        ->with([
            'enrollments' => function ($query) {
                $query->select([
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
                ]);
            },
        ])
        ->orderBy('lastName')
        ->orderBy('firstName')
        ->get();

    return Inertia::render('admin/users/index', [
        'users' => $users,
        'students' => $students,
    ]);
}



    public function updateName(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'User name updated successfully.');
    }

    public function updateEmail(Request $request, User $user)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        $user->update([
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'User email updated successfully.');
    }

public function updateRole(Request $request, User $user)
{
    $validated = $request->validate([
        'role' => ['required', 'in:user,parent'],
    ]);

    $user->update([
        'role' => $validated['role'],
    ]);

    return back()->with('success', 'User role updated successfully.');
}


    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'User password reset successfully.');
    }

public function addStudent(Request $request, User $user)
{
    abort_unless($user->role === 'parent', 403);

    $validated = $request->validate([
        'student_id' => [
            'required',
            'integer',
            'exists:students,id',
        ],
    ]);

    $user->students()->syncWithoutDetaching([
        $validated['student_id'],
    ]);

    return back()->with(
        'success',
        'Student added to parent successfully.'
    );
}


public function removeStudent(User $user, Student $student)
{
    abort_unless($user->role === 'parent', 403);

    $user->students()->detach($student->id);

    return back()->with(
        'success',
        'Student removed from parent successfully.'
    );
}



}
