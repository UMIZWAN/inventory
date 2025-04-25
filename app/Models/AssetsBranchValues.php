<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetsBranchValues extends Model
{
    use HasFactory;

    protected $table = 'assets_branch_values';

    protected $fillable = [
        'asset_id',
        'asset_branch_id',
        'asset_location_id',
        'asset_current_unit',
    ];

    public $timestamps = false;

    public function assets()
    {
        return $this->belongsTo(Assets::class, 'asset_id');
    }

    public function branch()
    {
        return $this->belongsTo(AssetsBranch::class, 'asset_branch_id');
    }

    public function location()
    {
        return $this->belongsTo(AssetsBranch::class, 'asset_location_id');
    }
}
