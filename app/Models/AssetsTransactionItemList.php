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
        'assets_transaction_id',
        'asset_id',
        'tax_id',
        'status',
        'asset_unit',
    ];

    public function asset()
    {
        return $this->belongsTo(Assets::class, 'asset_id');
    }
    public function transaction()
    {
        return $this->belongsTo(AssetsTransaction::class, 'assets_transaction_id');
    }
}
