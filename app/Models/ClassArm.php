<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassArm extends Model
{
    protected $fillable = ['year_level_id', 'classArmName'];

    public function yearLevel()
    {
        return $this->belongsTo(YearLevel::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->hasManyThrough(Student::class, Enrollment::class);
    }
}
