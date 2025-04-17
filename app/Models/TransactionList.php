<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionList extends Model
{
    protected $table = 'transaction_list';
    protected $fillable = [
        'assets_transaction_running_number',
        'asset_transaction_id',
        'assets_transaction_type',
        'assets_transaction_status',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
        'received_by',
        'received_at',
        'approved_by',
        'approved_at',
    ];
}
