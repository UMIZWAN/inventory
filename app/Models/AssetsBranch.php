<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AssetsBranch extends Model
{
    use HasFactory;
    protected $table = 'assets_branch';
    protected $fillable = ['name'];

    public function branch()
    {
        return $this->hasMany(AssetsBranchValues::class, 'assets_branch_id');
    }
    public function location()
    {
        return $this->hasMany(AssetsBranchValues::class, 'assets_location_id');
    }
}
