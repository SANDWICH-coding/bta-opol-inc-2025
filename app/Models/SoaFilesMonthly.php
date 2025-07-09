<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoaFilesMonthly extends Model
{
    protected $fillable = [
        'school_year_id',
        'file_name',
        'file_path',
        'created_at',
        'updated_at'
    ];
}
