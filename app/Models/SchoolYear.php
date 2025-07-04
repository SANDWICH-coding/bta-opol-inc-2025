<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolYear extends Model
{
    protected $fillable = ['name'];

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class);
    }

    public function billingDiscounts()
    {
        return $this->hasMany(BillingDisc::class);
    }
}
