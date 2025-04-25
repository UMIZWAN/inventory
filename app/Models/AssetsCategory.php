<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetsCategory extends Model
{
    use HasFactory;

    protected $table = 'assets_category';

    protected $fillable = ['name'];

    public function assets()
    {
        return $this->hasMany(Assets::class, 'asset_category_id');
    }
}
