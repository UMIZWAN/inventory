<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class AssetsTransactionPurpose extends Model
{
    // use HasFactory;

    protected $table = 'assets_transaction_purpose';

    protected $fillable = [
        'asset_transaction_purpose_name',
    ];

    protected function assetsTransactionPurposeName(): Attribute
    {
        return Attribute::make(
            set: fn($value) => strtoupper($value)
        );
    }

    public function assetsTransactions()
    {
        return $this->hasMany(AssetsTransaction::class, 'assets_transaction_purpose_id');
    }
}
