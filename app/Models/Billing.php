<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Billing extends Model
{
    protected $fillable = [
        'year_level_id',
        'billing_cat_id',
        'description',
        'amount',
    ];

        protected $casts = [
        'amount' => 'decimal:2',
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

    public function enrollments()
    {
        return $this->belongsToMany(Enrollment::class, 'enrollment_billing_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

        public function billingCat(): BelongsTo
    {
        return $this->belongsTo(BillingCat::class);
    }
}

