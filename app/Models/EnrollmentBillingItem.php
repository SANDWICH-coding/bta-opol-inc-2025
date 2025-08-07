<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentBillingItem extends Model
{
    protected $fillable = [
        'enrollment_id',
        'billing_id',
        'quantity',
        'month_installment', // Number of months for installment
        'start_month',       // e.g., 1 = January
        'end_month',         // e.g., 12 = December
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}

