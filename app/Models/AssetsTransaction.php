<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetsTransaction extends Model
{
    use HasFactory;
    protected $table = 'assets_transaction';
    protected $fillable = [
        'assets_transaction_running_number',
        'users_id',
        'assets_transaction_type',
        'assets_transaction_status',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
        'received_by',
        'received_at',
        'approved_by',
        'approved_at'
    ];

    public function itemList()
    {
        return $this->hasMany(AssetsTransactionItemList::class, 'asset_transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function receivedByUser()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
