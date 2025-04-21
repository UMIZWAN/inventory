<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetsTransactionItemList extends Model
{
    protected $table = 'assets_transaction_item_list';
    protected $fillable = [
        'assets_transaction_id',
        'asset_id',
        'transaction_value',
        'created_at',
        'updated_at'
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
