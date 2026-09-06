<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingPayment extends Model
{

    protected $fillable = [
        'enrollment_id',
        'billing_id',
        'or_number',
        'payment_date',
        'payment_method',
        'remarks',
        'amount',
    ];

        protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }

    public function billingItems(): HasMany
    {
        return $this->hasMany(
            EnrollmentBillingItem::class,
            'billing_id',
            'billing_id'
        )->whereColumn(
            'enrollment_id',
            'billing_payments.enrollment_id'
        );
    }

}
