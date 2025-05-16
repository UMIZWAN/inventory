<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AccessLevel;

class AccessLevelSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        // Public - no access
        AccessLevel::factory()->create([
            'name' => 'Vendor',
            // Settings
            'settings' => false,
            // Role
            'add_edit_role' => false,
            'view_role' => false,
            // User
            'add_edit_user' => false,
            'view_user' => false,
            // Asset
            'add_edit_asset' => false,
            'view_asset' => false,
            'view_asset_masterlist' => true,
            // Branch
            'add_edit_branch' => false,
            'view_branch' => false,
            // Transaction
            'add_edit_transaction' => false,
            'view_transaction' => false,
            'approve_reject_transaction' => false,
            'receive_transaction' => false,
            // Purchase Order
            'add_edit_purchase_order' => false,
            'view_purchase_order' => false,
            // Supplier
            'add_edit_supplier' => false,
            'view_supplier' => false,
            // Tax
            'add_edit_tax' => false,
            'view_tax' => false,
            // Reports
            'view_reports' => true,
            'download_reports' => true,
        ]);

        AccessLevel::factory()->create([
            'name' => 'Admin',
            // Settings
            'settings' => true,
            // Role
            'add_edit_role' => true,
            'view_role' => true,
            // User
            'add_edit_user' => true,
            'view_user' => true,
            // Asset
            'add_edit_asset' => true,
            'view_asset' => true,
            'view_asset_masterlist' => true,
            // Branch
            'add_edit_branch' => true,
            'view_branch' => true,
            // Transaction
            'add_edit_transaction' => true,
            'view_transaction' => true,
            'approve_reject_transaction' => true,
            'receive_transaction' => true,
            // Purchase Order
            'add_edit_purchase_order' => true,
            'view_purchase_order' => true,
            // Supplier
            'add_edit_supplier' => true,
            'view_supplier' => true,
            // Tax
            'add_edit_tax' => true,
            'view_tax' => true,
            // Reports
            'view_reports' => true,
            'download_reports' => true,
        ]);

        // Editor - edit and view, but no approvals
        AccessLevel::factory()->create([
            'name' => 'Editor',
            // Settings
            'settings' => false,
            // Role
            'add_edit_role' => false,
            'view_role' => true,
            // User
            'add_edit_user' => true,
            'view_user' => true,
            // Asset
            'add_edit_asset' => true,
            'view_asset' => true,
            'view_asset_masterlist' => true,
            // Branch
            'add_edit_branch' => true,
            'view_branch' => true,
            // Transaction
            'add_edit_transaction' => true,
            'view_transaction' => true,
            'approve_reject_transaction' => false,
            'receive_transaction' => true,
            // Purchase Order
            'add_edit_purchase_order' => true,
            'view_purchase_order' => true,
            // Supplier
            'add_edit_supplier' => true,
            'view_supplier' => true,
            // Tax
            'add_edit_tax' => true,
            'view_tax' => true,
            // Reports
            'view_reports' => true,
            'download_reports' => false,
        ]);

        // Viewer - view only
        AccessLevel::factory()->create([
            'name' => 'Viewer',
            // Settings
            'settings' => false,
            // Role
            'add_edit_role' => false,
            'view_role' => true,
            // User
            'add_edit_user' => false,
            'view_user' => true,
            // Asset
            'add_edit_asset' => false,
            'view_asset' => true,
            'view_asset_masterlist' => false,
            // Branch
            'add_edit_branch' => false,
            'view_branch' => true,
            // Transaction
            'add_edit_transaction' => false,
            'view_transaction' => true,
            'approve_reject_transaction' => false,
            'receive_transaction' => false,
            // Purchase Order
            'add_edit_purchase_order' => false,
            'view_purchase_order' => true,
            // Supplier
            'add_edit_supplier' => false,
            'view_supplier' => true,
            // Tax
            'add_edit_tax' => false,
            'view_tax' => true,
            // Reports
            'view_reports' => true,
            'download_reports' => false,
        ]);
    }
}
