<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollment_billing_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('enrollment_id')
                ->constrained('enrollments')
                ->onDelete('cascade');

            $table->foreignId('billing_id')
                ->constrained('billings')
                ->onDelete('cascade');

            $table->integer('quantity')->default(1);

            $table->integer('month_installment')->nullable(); // Number of months
            $table->unsignedTinyInteger('start_month')->nullable(); // e.g., 1 = January
            $table->unsignedTinyInteger('end_month')->nullable();   // e.g., 12 = December

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_billing_items');
    }
};
