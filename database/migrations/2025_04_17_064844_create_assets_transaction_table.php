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
    Schema::create('shipping_option', function (Blueprint $table) {
      $table->id();
      $table->string('shipping_option_name');
      $table->timestamps();
    });

    Schema::create('assets_transaction_purpose', function (Blueprint $table) {
      $table->id();
      $table->string('asset_transaction_purpose_name');
      $table->timestamps();
    });

    Schema::create('assets_transaction', function (Blueprint $table) {
      $table->id();
      $table->string('assets_transaction_running_number')->unique();
      $table->unsignedBigInteger('supplier_id')->nullable();
      $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();

      $table->enum('assets_transaction_type', ['ASSET IN', 'ASSET OUT', 'ASSET TRANSFER']);
      $table->string('assets_recipient_name')->nullable();
      $table->foreignId('assets_shipping_option_id')->nullable()->constrained('shipping_option')->nullOnDelete();

      // STATUS only relevant for ASSET TRANSFER
      $table->enum('assets_transaction_status', ['REQUESTED', 'REJECTED', 'APPROVED', 'IN-TRANSIT', 'RECEIVED', 'IN PROGRESS', 'COMPLETED'])->nullable();

      // PURPOSE: allow multiple purposes (JSON)
      $table->foreignId('assets_transaction_purpose_id')->nullable()->constrained('assets_transaction_purpose')->nullOnDelete();

      $table->foreignId('assets_from_branch_id')->nullable()->constrained('assets_branch')->cascadeOnDelete();
      $table->foreignId('assets_to_branch_id')->nullable()->constrained('assets_branch')->cascadeOnDelete();
      $table->text('assets_transaction_remark')->nullable();
      $table->json('assets_transaction_log')->nullable();
      $table->decimal('assets_transaction_total_cost', 12, 2)->nullable();

      // Trackers
      $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
      $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
      $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
      $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
      $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();

      $table->dateTime('created_at')->nullable();
      $table->dateTime('updated_at')->nullable();
      $table->dateTime('received_at')->nullable();
      $table->dateTime('approved_at')->nullable();
      $table->dateTime('rejected_at')->nullable();
    });

    Schema::create('assets_transaction_item_list', function (Blueprint $table) {
      $table->id();
      $table->foreignId('asset_transaction_id')->nullable()->constrained('assets_transaction')->cascadeOnDelete();
      $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_order')->cascadeOnDelete();
      $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
      $table->enum('status', ['ON HOLD', 'DELIVERED', 'FROZEN', 'RECEIVED', 'RETURNED', 'DISPOSED'])->nullable();
      $table->integer('asset_unit');
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
