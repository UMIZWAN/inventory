<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_order';

    protected $fillable = [
        'supplier_id',
        'expected_receipt_date',
        'tax_id',
        'billing_address',
        'shipping_address',
        'tracking_ref',
        'purchase_order_notes',
        'purchase_internal_notes',
        'purchase_order_running_number',
        'created_by',
        'updated_by',
        'received_by',
        'approved_by',
    ];

    protected $casts = [
        'expected_receipt_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'received_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function suppliers()
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function tax()
    {
        return $this->belongsTo(Tax::class);
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
}
