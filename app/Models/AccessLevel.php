<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLevel extends Model
{
    use HasFactory;

    protected $table = 'access_level';

    protected $fillable = [
        'name',
        // Role
        'add_edit_role',
        'view_role',
        // User
        'add_edit_user',
        'view_user',
        // Asset
        'add_edit_asset',
        'view_asset',
        'view_asset_masterlist',
        // Branch
        'add_edit_branch',
        'view_branch',
        // Transaction
        'add_edit_transaction',
        'view_transaction',
        'approve_reject_transaction',
        'receive_transaction',
        // Purchase Order
        'add_edit_purchase_order',
        'view_purchase_order',
        // Supplier
        'add_edit_supplier',
        'view_supplier',
        // Tax
        'add_edit_tax',
        'view_tax',
        // Reports
        'view_reports',
        'download_reports',
    ];

    protected $casts = [
        'add_edit_role' => 'boolean',
        'view_role' => 'boolean',
        'add_edit_user' => 'boolean',
        'view_user' => 'boolean',
        'add_edit_asset' => 'boolean',
        'view_asset' => 'boolean',
        'view_asset_masterlist' => 'boolean',
        'add_edit_branch' => 'boolean',
        'view_branch' => 'boolean',
        'add_edit_transaction' => 'boolean',
        'view_transaction' => 'boolean',
        'approve_reject_transaction' => 'boolean',
        'receive_transaction' => 'boolean',
        'add_edit_purchase_order' => 'boolean',
        'view_purchase_order' => 'boolean',
        'add_edit_supplier' => 'boolean',
        'view_supplier' => 'boolean',
        'add_edit_tax' => 'boolean',
        'view_tax' => 'boolean',
        'view_reports' => 'boolean',
        'download_reports' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'access_level_id');
    }
}
