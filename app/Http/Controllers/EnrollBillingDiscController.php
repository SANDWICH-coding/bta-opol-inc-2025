<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnrollBillingDiscController extends Controller
{
    public function applyDiscount(Request $request)
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'discount_ids' => 'array',
            'discount_ids.*' => 'exists:billing_discs,id',
        ]);

        $enrollment = Enrollment::findOrFail($request->enrollment_id);

        // Detach existing and reattach new
        $enrollment->billingDiscounts()->sync($request->discount_ids);

        return back()->with('success', 'Discounts updated successfully');
    }

}
