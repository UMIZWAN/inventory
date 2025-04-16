<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetsTag extends Model
{
    use HasFactory;
    protected $table = 'assets_tag';
    protected $fillable = ['name'];

    public function assets()
    {
        return $this->hasMany(Assets::class, 'asset_tag_id');
    }
}
