<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class AssetsTransaction extends Model
{
    use HasFactory, HasApiTokens;

    public const TYPES = ['ASSET IN', 'ASSET OUT'];
    public const STATUSES = ['DRAFT', 'IN-TRANSIT', 'RECEIVED'];
    public const PURPOSES = ['INSURANCE', 'CSI', 'EVENT/ ROADSHOW', 'SPECIAL REQUEST'];

    protected $table = 'assets_transaction';

    protected $fillable = [
        'assets_transaction_running_number',
        'supplier_id',
        'assets_shipping_option',
        'assets_transaction_type',
        'assets_transaction_status',
        'assets_transaction_purpose',
        'assets_from_branch_id',
        'assets_to_branch_id',
        'assets_transaction_remark',
        'assets_transaction_log',
        'assets_transaction_total_cost',
        'created_by',
        'updated_by',
        'received_by',
        'approved_by',
        'created_at',
        'updated_at',
        'received_at',
        'approved_at',
    ];

    protected $casts = [
        'assets_transaction_purpose' => 'array',
        'assets_transaction_log' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'received_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Relationships

    public function supplier()
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function fromBranch()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_from_branch_id');
    }

    public function toBranch()
    {
        return $this->belongsTo(AssetsBranch::class, 'assets_to_branch_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transactionItems()
    {
        return $this->hasMany(AssetsTransactionItemList::class, 'asset_transaction_id');
    }
}
