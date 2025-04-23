<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suppliers extends Model
{
    use HasFactory;

    protected $table = 'suppliers';

    protected $fillable = [
        'supplier_name',
        'supplier_office_number',
        'supplier_email',
        'supplier_address',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
