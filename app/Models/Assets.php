<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
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

    /**
     * Append an action to the assets_log as a sentence describing changes.
     *
     * @param string $action
     * @param array  $changes  Field => ['old' => oldValue, 'new' => newValue]
     */
    public function appendLogSentence(string $action, array $changes = []): void
    {
        $running   = $this->asset_running_number;
        $user      = Auth::user()->name;
        $time      = now()->format('Y-m-d H:i:s');
        $descriptions = [];

        foreach ($changes as $field => $vals) {
            $descriptions[] = "{$field} dari '{$vals['old']}' menjadi '{$vals['new']}'";
        }

        $detail = $descriptions
            ? implode(', ', $descriptions)
            : 'tanpa perubahan pada detail';

        $sentence = "$user $action Asset $running pada $time, $detail.";

        $logs = $this->assets_log ?? [];
        $logs[] = $sentence;

        $this->assets_log = $logs;
        $this->saveQuietly();
    }

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
