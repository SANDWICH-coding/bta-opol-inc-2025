<?php

namespace App\Http\Controllers;

use App\Models\BillingDisc;
use Illuminate\Http\Request;

class BillingDiscController extends Controller
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
            'school_year_id' => 'required|exists:school_years,id',
            'billing_cat_id' => 'required|exists:billing_cats,id',
            'description' => 'nullable|string|max:255',
            'value' => 'required|in:fixed,percentage',
            'amount' => 'required|numeric|min:0',
        ], [
            'billing_cat_id.required' => 'Billing category is required.',
            'value.required' => 'Discount type is required.',
            'amount.required' => 'Amount is required.',
        ]);

        // Create billing discount record
        BillingDisc::create($validated);

        return redirect()->back()->with('success', 'Billing discount created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
