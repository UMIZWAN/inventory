<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

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

    public $timestamps = false;

    protected function supplierName(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }
    protected function supplierAddress(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value),
        );
    }

    // Relationships
    public function assetsTransactions()
    {
        return $this->hasMany(AssetsTransaction::class);
    }
}
