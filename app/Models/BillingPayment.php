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
        'amount',
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
