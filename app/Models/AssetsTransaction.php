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
Schema::create('assets_transaction', function (Blueprint $table) {
    $table->id();
    $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
    $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
    $table->string('assets_transaction_description');
    $table->timestamps();
});
