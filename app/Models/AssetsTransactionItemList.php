<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetsTransactionItemList extends Model
{
    use HasFactory;

    public const STATUSES = [
        'ON HOLD',
        'DELIVERED',
        'FROZEN',
        'RECEIVED',
        'RETURNED',
        'DISPOSED',
    ];

    protected $table = 'assets_transaction_item_list';

    protected $fillable = [
        'asset_transaction_id',
        'purchase_order_id',
        'asset_id',
        'status',
        'asset_unit',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationships
    public function assetsTransaction()
    {
        return $this->belongsTo(AssetsTransaction::class, 'asset_transaction_id');
    }
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }
    public function assets()
    {
        return $this->belongsTo(Assets::class, 'asset_id');
    }
}
