<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'lrn',
        'lastName',
        'firstName',
        'middleName',
        'suffix',
        'gender',
        'birthDate',
        'profilePhoto'
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function parents()
{
    return $this->belongsToMany(
        User::class,
        'parent_student',
        'student_id',
        'parent_id'
    )->withTimestamps();
}

}
