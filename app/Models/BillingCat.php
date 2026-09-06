<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingCat extends Model
{
    //
    protected $fillable = ['name'];

        public function billings(): HasMany
    {
        return $this->hasMany(Billing::class);
    }
}
