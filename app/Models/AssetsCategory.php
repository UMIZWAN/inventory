<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class AssetsCategory extends Model
{
    use HasFactory;

    protected $table = 'assets_category';

    protected $fillable = ['name'];

    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }

    public function assets()
    {
        return $this->hasMany(Assets::class, 'asset_category_id');
    }
}
