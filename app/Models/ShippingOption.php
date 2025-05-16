<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ShippingOption extends Model

{
    // use HasFactory;

    protected $table = 'shipping_option';

    protected $fillable = [
        'shipping_option_name',
    ];

    protected function shippingOptionName(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }

    public function assetsTransactions()
    {
        return $this->hasMany(AssetsTransaction::class, 'assets_shipping_option_id');
    }
}
