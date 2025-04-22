<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /** Purchase Order
         Schema::create('supplier', function (Blueprint $table) {
           $table->id();
           $table->string('supplier_name');
           $table->string('supplier_office_number')->nullable();
           $table->string('supplier_email')->nullable();
           $table->string('supplier_address')->nullable();
         });

         Schema::create('tax', function (Blueprint $table) {
           $table->id();
           $table->string('tax_name');
           $table->decimal('tax_percentage', 5, 2);
         });

          Schema::create('purchase_order', function (Blueprint $table) {
           $table->id();
           $table->foreignId('supplier_id')->constrained('supplier')->cascadeOnDelete();
           $table->date('expected_receipt_date');
           $table->foreignId('tax_id')->constrained('tax')->cascadeOnDelete();
           $table->text('billing_address');
           $table->text('shipping_address');
           $table->string('tracking_ref')->unique();
           $table->text('purchase_order_notes')->nullable();
           $table->text('purchase_internal_notes')->nullable();
           $table->string('purchase_order_running_number')->unique();
           $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
         });
         
         
         **/


        Schema::create('assets_transaction', function (Blueprint $table) {
            $table->id();
            $table->string('assets_transaction_running_number')->unique();
            $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
            $table->enum('assets_transaction_type', ['ASSET IN', 'ASSET OUT']);
            $table->enum('assets_transaction_status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->enum('assets_transaction_purpose', ['INSURANCE', 'CSI', 'EVENT/ ROADSHOW', 'SPECIAL REQUEST'])->nullable();
            $table->foreignId('assets_branch_id')->constrained('assets_branch')->cascadeOnDelete();
            $table->text('assets_transaction_remark')->nullable();
            $table->json('assets_transaction_log')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->unsignedBigInteger('received_by')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('received_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('assets_transaction_item_list', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_transaction_id')->constrained('assets_transaction')->cascadeOnDelete();
            $table->unsignedBigInteger('tax_id')->nullable();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->enum('status', ['ON HOLD', 'DELIVERED', 'FROZEN', 'RECEIVED', 'RETURNED', 'DISPOSED'])->nullable();
            $table->string('transaction_value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets_transaction_item_list');
        Schema::dropIfExists('assets_transaction');
    }
};
