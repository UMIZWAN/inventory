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
        'asset_stable_unit',
        'asset_purchase_cost',
        'asset_sales_cost',
        'asset_unit_measure',
        'asset_image',
        'assets_remark',
        'assets_log',
    ];

    protected $casts = [
        'assets_log' => 'array',
        'asset_purchase_cost' => 'decimal:4',
        'asset_sales_cost' => 'decimal:4',
    ];

    public function branchValues()
    {
        return $this->hasMany(AssetsBranchValues::class, 'asset_id');
    }

    public function category()
    {
        return $this->belongsTo(AssetsCategory::class, 'asset_category_id');
    }

    public function tag()
    {
        return $this->belongsTo(AssetsTag::class, 'asset_tag_id');
    }

    // public function itemList()
    // {
    //     return $this->hasMany(AssetsTransactionItemList::class, 'assets_id');
    // }
    /**
     * Append an action to the assets_log as a sentence describing changes.
     *
     * @param string $action
     * @param array  $changes  Field => ['old' => oldValue, 'new' => newValue]
     */
    // public function appendLogSentence(string $action, array $changes = []): void
    // {
    //     $running   = $this->asset_running_number;
    //     $user      = Auth::user()->name;
    //     $time      = now()->format('Y-m-d H:i:s');
    //     $descriptions = [];

    //     foreach ($changes as $field => $vals) {
    //         if ($field == 'asset_type') {
    //             $field = 'Tipe Aset';
    //         }
    //         if ($field == 'asset_category_id') {
    //             $field = 'Kategori Aset';
    //             $categoryName = AssetsCategory::find($vals['new'])->name ?? 'Unknown Category';
    //             $vals['new'] = $categoryName;
    //             $categoryOldName = AssetsCategory::find($vals['old'])->name ?? 'Unknown Category';
    //             $vals['old'] = $categoryOldName;
    //         }
    //         if ($field == 'asset_tag_id') {
    //             $field = 'Tag Aset';
    //             $tagName = AssetsTag::find($vals['new'])->name ?? 'Unknown Tag';
    //             $vals['new'] = $tagName;
    //             $tagOldName = AssetsTag::find($vals['old'])->name ?? 'Unknown Tag';
    //             $vals['old'] = $tagOldName;
    //         }
    //         if ($field == 'asset_stable_value') {
    //             $field = 'Nilai Aset Tetap';
    //         }
    //         if ($field == 'asset_current_value') {
    //             $field = 'Nilai Aset Sekarang';
    //         }
    //         if ($field == 'assets_branch_id') {
    //             $field = 'Cabang';
    //             // Get the branch name
    //             $branchName = AssetsBranch::find($vals['new'])->name ?? 'Unknown Branch';
    //             $vals['new'] = $branchName;
    //             $branchOldName = AssetsBranch::find($vals['old'])->name ?? 'Unknown Branch';
    //             $vals['old'] = $branchOldName;
    //         }
    //         if ($field == 'assets_location_id') {
    //             $field = 'Lokasi';
    //             // Get the location name
    //             $locationName = AssetsBranch::find($vals['new'])->name ?? 'Unknown Location';
    //             $vals['new'] = $locationName;
    //             $locationOldName = AssetsBranch::find($vals['old'])->name ?? 'Unknown Location';
    //             $vals['old'] = $locationOldName;
    //         }
    //         if ($field == 'asset_sales_cost') {
    //             $field = 'Harga Jual';
    //         }
    //         if ($field == 'asset_purchase_cost') {
    //             $field = 'Harga Beli';
    //         }
    //         if ($field == 'asset_unit_measure') {
    //             $field = 'Ukuran Unit';
    //         }
    //         if ($field == 'assets_remark') {
    //             $field = 'Catatan';
    //         }

    //         $descriptions[] = "{$field} dari '{$vals['old']}' menjadi '{$vals['new']}'";
    //     }

    //     $detail = $descriptions
    //         ? implode(', ', $descriptions)
    //         : 'tanpa perubahan pada detail';

    //     $sentence = "$user $action Asset $running pada $time, $detail.";

    //     $logs = $this->assets_log ?? [];
    //     $logs[] = $sentence;

    //     $this->assets_log = $logs;
    //     $this->saveQuietly();
    // }
}
