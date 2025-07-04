<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingDisc extends Model
{
    protected $fillable = [
        'school_year_id',
        'billing_cat_id',
        'description',
        'value',
        'amount',
    ];

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function category()
    {
        return $this->belongsTo(BillingCat::class, 'billing_cat_id');
    }
}
