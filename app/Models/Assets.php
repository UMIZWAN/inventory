<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Assets extends Model
{
    use HasFactory;
    protected $table = 'assets';

    protected $fillable = [
        'name',
        'asset_running_number',
        'asset_type',
        'asset_category_id',
        'asset_tag_id',
        'asset_stable_value',
        'asset_current_value',
        'assets_branch_id',
        'assets_location',
        'asset_image',
        'assets_remark',
        'assets_log'
    ];

    protected $casts = [
        'assets_remark' => 'array',
        'assets_log' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(AssetsCategory::class, 'asset_category_id');
    }

    public function tag()
    {
        return $this->belongsTo(AssetsTag::class, 'asset_tag_id');
    }

    public function branch()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_branch_id');
    }
    public function itemList()
    {
        return $this->hasMany(AssetsTransactionItemList::class, 'assets_id');
    }
}
