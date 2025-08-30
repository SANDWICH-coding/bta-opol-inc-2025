<?php

namespace App\Http\Controllers;

use App\Models\BillingExpenses;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingExpensesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Filtered expenses (for table)
        $expenses = BillingExpenses::with('schoolYear')
            ->when($search, function ($query, $search) {
                $query->where('expense_category', 'like', "%{$search}%")
                    ->orWhere('vendor_merchant', 'like', "%{$search}%")
                    ->orWhere('receipt_number', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        // === NEW: Always fetch all (unfiltered) totals ===
        $allExpenses = BillingExpenses::all();

        // Calculate totals in PHP (so frontend doesn’t need to recalc)
        $overallTotal = $allExpenses->sum('amount');

        $categoryTotals = $allExpenses
            ->groupBy('expense_category')
            ->map(function ($group) {
                return $group->sum('amount');
            });

        return Inertia::render('billing/billing-expenses', [
            'expenses' => $expenses,
            'filters' => [
                'search' => $search,
            ],
            // Send extra data for dashboard cards
            'overallTotal' => $overallTotal,
            'categoryTotals' => $categoryTotals,
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
        // validate request data
        $validated = $request->validate([
            'expense_category' => 'required|string|max:255',
            'vendor_merchant' => 'required|string|max:255',
            'expense_date' => 'required|date',
            'receipt_number' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:255',
            'responsible' => 'required|string|max:255',
            'receipt_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // find the active school year
        $activeSchoolYear = SchoolYear::where('is_active', true)->first();

        if (!$activeSchoolYear) {
            return back()->withErrors(['school_year_id' => 'No active school year found.']);
        }

        // handle photo upload if provided
        if ($request->hasFile('receipt_photo')) {
            $path = $request->file('receipt_photo')->store('receipts', 'public');
            $validated['receipt_photo'] = $path;
        }

        // assign school_year_id automatically
        $validated['school_year_id'] = $activeSchoolYear->id;

        // create the billing expense
        BillingExpenses::create($validated);

        return back()->with('success', 'Expense successfully recorded.');
    }


    /**
     * Display the specified resource.
     */
    public function show(BillingExpenses $billingExpenses)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BillingExpenses $billingExpenses)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BillingExpenses $billingExpenses)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BillingExpenses $billingExpenses)
    {
        //
    }
}
