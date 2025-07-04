<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoaFile extends Model
{
    protected $fillable = [
        'enrollment_id',
        'file_path',
        'file_name',
        'generated_at',
    ];

    protected $dates = ['generated_at'];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }
}
