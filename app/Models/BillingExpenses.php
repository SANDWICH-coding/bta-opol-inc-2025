<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingExpenses extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_year_id',
        'expense_category',
        'description',
        'vendor_merchant',
        'expense_date',
        'receipt_number',
        'amount',
        'remarks',
        'responsible',
        'receipt_photo',
    ];

    /**
     * Relationship: BillingExpense belongs to a SchoolYear
     */
    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }
}
