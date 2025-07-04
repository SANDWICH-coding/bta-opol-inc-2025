<?php

namespace App\Http\Controllers;

use App\Models\ClassArm;
use App\Models\SchoolYear;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassArmController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year_level_id' => 'required|exists:year_levels,id',
            'classArmName' => 'required|string|max:50',
        ], [
            'classArmName.max' => 'This field must not be greater than 50 characters.',
            'classArmName.required' => 'This field is required.',
        ]);

        ClassArm::create($validated);

        return redirect()->back()->with('success', 'Class arm created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $classArm = ClassArm::with(['enrollments.student', 'yearLevel.schoolYear'])->findOrFail($id);
        $students = $classArm->enrollments->pluck('student')->filter()->values();
        $schoolYear = $classArm->yearLevel->schoolYear;

        return Inertia::render('registrar/class-list', [
            'classArm' => $classArm,
            'students' => $students,
            'schoolYear' => $schoolYear,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
