<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollBillingDisc extends Model
{
    protected $fillable = ['enrollment_id', 'billing_disc_id'];

    public function billingDisc()
    {
        return $this->belongsTo(BillingDisc::class);
    }
}
