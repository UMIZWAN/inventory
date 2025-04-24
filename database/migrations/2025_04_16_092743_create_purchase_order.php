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
        Schema::create('suppliers', function (Blueprint $table) {
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
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->date('expected_receipt_date');
            $table->foreignId('tax_id')->constrained('tax')->cascadeOnDelete();
            $table->text('billing_address');
            $table->text('shipping_address');
            $table->string('tracking_ref')->unique();
            $table->text('purchase_order_notes')->nullable();
            $table->text('purchase_internal_notes')->nullable();
            $table->string('purchase_order_running_number')->unique();
            // Trackers
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->dateTime('approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order');
        Schema::dropIfExists('supplier');
        Schema::dropIfExists('tax');
    }
};
