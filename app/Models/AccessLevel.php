<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLevel extends Model
{
    use HasFactory;
    protected $table = 'access_level';

    protected $fillable = [
        'name',
        'add_asset',
        'edit_asset',
        'delete_asset',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'access_level_id');
    }
}
