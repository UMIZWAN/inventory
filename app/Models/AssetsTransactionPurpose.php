<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetsTransactionPurpose extends Model
{
    // use HasFactory;

    protected $table = 'assets_transaction_purpose';

    protected $fillable = [
        'asset_transaction_purpose_name',
    ];

    public function assetsTransactions()
    {
        return $this->hasMany(AssetsTransaction::class, 'assets_transaction_purpose_id');
    }
}
