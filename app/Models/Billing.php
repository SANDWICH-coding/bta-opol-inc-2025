<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    protected $fillable = [
        'year_level_id',
        'billing_cat_id',
        'description',
        'amount',
    ];

    public function yearLevel()
    {
        return $this->belongsTo(YearLevel::class);
    }

    public function category()
    {
        return $this->belongsTo(BillingCat::class, 'billing_cat_id');
    }

    public function payments()
    {
        return $this->hasMany(BillingPayment::class);
    }
}

