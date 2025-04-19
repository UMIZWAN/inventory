<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetsTransaction extends Model
{
    protected $table = 'assets_transaction';
    protected $fillable = [
        'asset_id',
        'users_id',
        'assets_transaction_description'
    ];
}