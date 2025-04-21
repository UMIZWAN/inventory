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
        'asset_description',
        'asset_type',
        'asset_category_id',
        'asset_tag_id',
        'asset_stable_value',
        'asset_current_value',
        'asset_purchase_cost',
        'asset_sales_cost',
        'asset_unit_measure',
        'assets_branch_id',
        'assets_location_id',
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
    public function location()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_location_id');
    }

    public function itemList()
    {
        return $this->hasMany(AssetsTransactionItemList::class, 'assets_id');
    }
}
