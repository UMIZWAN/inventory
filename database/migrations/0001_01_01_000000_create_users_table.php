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
        Schema::create('access_level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // Role 
            $table->boolean('add_edit_role')->default(false);
            $table->boolean('view_role')->default(false);
            // User
            $table->boolean('add_edit_user')->default(false);
            $table->boolean('view_user')->default(false);
            // Asset
            $table->boolean('add_edit_asset')->default(false);
            $table->boolean('view_asset')->default(false);
            // Branch
            $table->boolean('add_edit_branch')->default(false);
            $table->boolean('view_branch')->default(false);
            // Transaction
            $table->boolean('add_edit_transaction')->default(false);
            $table->boolean('view_transaction')->default(false);
            $table->boolean('approve_reject_transaction')->default(false);
            $table->boolean('receive_transaction')->default(false);
            // Purchase Order
            $table->boolean('add_edit_purchase_order')->default(false);
            $table->boolean('view_purchase_order')->default(false);
            // Supplier
            $table->boolean('add_edit_supplier')->default(false);
            $table->boolean('view_supplier')->default(false);
            // Tax
            $table->boolean('add_edit_tax')->default(false);
            $table->boolean('view_tax')->default(false);
            // Reports
            $table->boolean('view_reports')->default(false);
            $table->boolean('download_reports')->default(false);
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->foreignId('access_level_id')->constrained('access_level');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('access_level');
    }
};
