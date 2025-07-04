<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'type',
        'class_arm_id',
        'student_id'
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function classArm()
    {
        return $this->belongsTo(ClassArm::class);
    }

    public function discounts()
    {
        return $this->belongsToMany(BillingDisc::class, 'enrollment_discounts');
    }

    public function billingDiscounts()
    {
        return $this->belongsToMany(BillingDisc::class, 'enroll_billing_discs')
            ->withTimestamps()
            ->with('category');
    }

    public function payments()
    {
        return $this->hasMany(BillingPayment::class);
    }

    public function soaFiles()
    {
        return $this->hasMany(SoaFile::class);
    }
}
