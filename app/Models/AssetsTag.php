<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetsTag extends Model
{
    use HasFactory;

    protected $table = 'assets_tag';

    protected $fillable = ['name'];
}
