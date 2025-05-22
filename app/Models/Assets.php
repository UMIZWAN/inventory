<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected function assetRunningNumber(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }

    public function branchValues()
    {
        return $this->hasMany(AssetsBranchValues::class, 'asset_id');
    }

    public function transactionItems(){
        return $this->hasMany(AssetsTransactionItemList::class,'asset_id');
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
    /**
     * Append a log entry to the asset's log history
     * 
     * @param string $action The action being performed (e.g., 'mengemaskini')
     * @param array $changes Array of changes with old and new values
     * @return void
     */
    public function appendLogSentence(string $action, array $changes = []): void
    {
        $running = $this->asset_running_number;
        $user = Auth::user()->name;
        $time = now()->format('Y-m-d H:i:s');
        $descriptions = [];

        // Field name mapping for better readability
        $fieldMappings = [
            'name' => 'Nama',
            'asset_type' => 'Tipe Aset',
            'asset_category_id' => 'Kategori Aset',
            'asset_tag_id' => 'Tag Aset',
            'asset_stable_unit' => 'Unit Aset Tetap',
            'asset_current_unit' => 'Unit Aset Sekarang',
            'asset_purchase_cost' => 'Harga Beli',
            'asset_sales_cost' => 'Harga Jual',
            'asset_unit_measure' => 'Ukuran Unit',
            'assets_remark' => 'Catatan',
            'assets_branch_id' => 'Cabang',
            'assets_location_id' => 'Lokasi',
            'asset_description' => 'Deskripsi',
            'asset_image' => 'Gambar'
        ];

        foreach ($changes as $field => $vals) {
            // Skip if old and new values are the same
            if (isset($vals['old']) && isset($vals['new']) && $vals['old'] === $vals['new']) {
                continue;
            }

            // Get the human-readable field name
            $fieldName = $fieldMappings[$field] ?? $field;

            // Handle special cases for related models
            if ($field == 'asset_category_id') {
                $vals['new'] = isset($vals['new']) ?
                    AssetsCategory::find($vals['new'])->name ?? 'Unknown Category' : 'None';
                $vals['old'] = isset($vals['old']) ?
                    AssetsCategory::find($vals['old'])->name ?? 'Unknown Category' : 'None';
            }

            if ($field == 'asset_tag_id') {
                $vals['new'] = isset($vals['new']) ?
                    AssetsTag::find($vals['new'])->name ?? 'Unknown Tag' : 'None';
                $vals['old'] = isset($vals['old']) ?
                    AssetsTag::find($vals['old'])->name ?? 'Unknown Tag' : 'None';
            }

            if ($field == 'assets_branch_id') {
                $vals['new'] = isset($vals['new']) ?
                    AssetsBranch::find($vals['new'])->name ?? 'Unknown Branch' : 'None';
                $vals['old'] = isset($vals['old']) ?
                    AssetsBranch::find($vals['old'])->name ?? 'Unknown Branch' : 'None';
            }

            if ($field == 'assets_location_id') {
                $vals['new'] = isset($vals['new']) ?
                    AssetsBranch::find($vals['new'])->name ?? 'Unknown Location' : 'None';
                $vals['old'] = isset($vals['old']) ?
                    AssetsBranch::find($vals['old'])->name ?? 'Unknown Location' : 'None';
            }

            // Format numeric values
            if (in_array($field, ['asset_purchase_cost', 'asset_sales_cost'])) {
                $vals['new'] = isset($vals['new']) ? number_format($vals['new'], 2) : '0.00';
                $vals['old'] = isset($vals['old']) ? number_format($vals['old'], 2) : '0.00';
            }

            // Handle image changes differently
            if ($field == 'asset_image') {
                $descriptions[] = "{$fieldName} telah diperbarui";
                continue;
            }

            // Format the change description
            $oldValue = $vals['old'] ?? 'None';
            $newValue = $vals['new'] ?? 'None';

            $descriptions[] = "{$fieldName} dari '{$oldValue}' menjadi '{$newValue}'";
        }

        // Create the log sentence
        if (empty($descriptions)) {
            $sentence = "$user $action Asset $running pada $time, tanpa perubahan pada detail.";
        } else {
            $detail = implode(', ', $descriptions);
            $sentence = "$user $action Asset $running pada $time, $detail.";
        }

        // Get existing logs or initialize empty array
        $logs = is_array($this->assets_log) ? $this->assets_log : (is_string($this->assets_log) ? json_decode($this->assets_log, true) : []);

        // Add new log entry
        $logs[] = $sentence;

        // Update the model
        $this->assets_log = $logs;

        // Save without triggering events
        $this->saveQuietly();
    }
}
