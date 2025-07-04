<?php

namespace App\Http\Controllers;

use App\Models\BillingPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingPaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'or_number' => 'required|string|max:50',
            'payment_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.billing_id' => 'required|exists:billings,id',
            'items.*.amount' => 'required|numeric|min:0.01',
            'items.*.payment_method' => 'required|string|max:50',
        ]);

        foreach ($validated['items'] as $item) {
            BillingPayment::create([
                'enrollment_id' => $validated['enrollment_id'],
                'billing_id' => $item['billing_id'],
                'or_number' => $validated['or_number'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $item['payment_method'],
                'amount' => $item['amount'],
            ]);
        }

        return back()->with('success', 'Payments successfully recorded.');
    }

}
