<?php

namespace App\Http\Controllers;

use App\Models\BillingCat;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use App\Models\SchoolYear;
use Inertia\Inertia;

class SchoolYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $schoolYears = SchoolYear::withCount('yearLevels')->get();

        return Inertia::render('admin/school-year', [
            'schoolYears' => $schoolYears,
        ]);
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
            'name' => 'required|string|max:9|min:9|unique:school_years',
        ]);
        SchoolYear::create($validated);

        return redirect()->route('admin.school-year.index')
            ->with('success', 'School year created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $schoolYear = SchoolYear::with([
            'yearLevels.classArms',
            'yearLevels.billings.category',
            'billingDiscounts.category',
        ])->findOrFail($id);

        $billingCategories = BillingCat::all(['id', 'name']);

        return Inertia::render('admin/sy-manage', [
            'schoolYear' => $schoolYear,
            'billingCategories' => $billingCategories,
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
        $schoolYear = SchoolYear::findOrFail($id);

        $schoolYear->delete();

        return redirect()->route('admin.school-year.index')
            ->with('success', 'School year deleted successfully.');
    }
}
