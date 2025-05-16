<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;


class AssetsBranch extends Model
{
    use HasFactory;
    protected $table = 'assets_branch';
    protected $fillable = ['name'];

    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }

    public function branch()
    {
        return $this->hasMany(AssetsBranchValues::class, 'assets_branch_id');
    }
    public function location()
    {
        return $this->hasMany(AssetsBranchValues::class, 'assets_location_id');
    }
    public function user()
    {
        return $this->hasMany(User::class, 'branch_id');
    }
}
