<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class YearLevel extends Model
{
    protected $fillable = ['school_year_id', 'yearLevelName'];

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function classArms()
    {
        return $this->hasMany(ClassArm::class);
    }

    public function billings()
    {
        return $this->hasMany(Billing::class);
    }

    public function enrollments()
    {
        return $this->hasManyThrough(
            Enrollment::class,
            ClassArm::class,
            'year_level_id',     // Foreign key on class_arms table...
            'class_arm_id',      // Foreign key on enrollments table...
            'id',                // Local key on year_levels table...
            'id'                 // Local key on class_arms table...
        );
    }
}
