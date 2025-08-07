<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentBillingItem;
use Illuminate\Http\Request;

class EnrollmentBillingItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'billing_id' => 'required|exists:billings,id',
            'quantity' => 'required|integer|min:1',
            'month_installment' => 'nullable|integer|min:1',
            'start_month' => 'nullable|integer|min:1|max:12',
            'end_month' => 'nullable|integer|min:1|max:12',
        ]);

        EnrollmentBillingItem::create($validated);

        return back()->with('success', 'Billing item added successfully.');
    }
}
