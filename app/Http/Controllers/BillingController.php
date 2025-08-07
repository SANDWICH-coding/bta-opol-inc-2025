<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\BillingCat;
use Illuminate\Http\Request;

class BillingController extends Controller
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
            'category' => 'required|string|max:50',
            'description' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $billingCat = BillingCat::firstOrCreate([
            'name' => $validated['category']
        ]);

        Billing::create([
            'year_level_id' => $validated['year_level_id'],
            'billing_cat_id' => $billingCat->id,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
        ]);

        return back(303);
    }

    /**
     * Display the specified resource.
     */
    public function show(Billing $billing)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Billing $billing)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Billing $billing)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Billing $billing)
    {
        //
    }
}
