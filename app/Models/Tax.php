<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    use HasFactory;

    protected $table = 'tax';

    protected $fillable = [
        'tax_name',
        'tax_percentage',
    ];

    public $timestamps = false;

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
