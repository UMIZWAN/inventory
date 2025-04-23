<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetBranchValues extends Model
{
    use HasFactory;
    protected $table = 'asset_branch_values';

    protected $fillable = [
        'asset_id',
        'assets_branch_id',
        'assets_location_id',
        'asset_current_unit',
    ];

    public function asset()
    {
        return $this->belongsTo(Assets::class, 'asset_id');
    }

    public function branch()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_branch_id');
    }

    public function location()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_location_id');
    }
}
