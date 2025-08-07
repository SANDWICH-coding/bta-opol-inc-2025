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
        Schema::create('billing_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->foreignId('billing_id')->constrained('billings')->onDelete('cascade'); // what was paid
            $table->string('or_number'); // Official Receipt number
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'gcash', 'bank_transfer', 'check'])->default('cash');
            $table->enum('remarks', ['partial_payment', 'full_payment', 'down_payment'])->default('full_payment'); // Remarks for the payment
            $table->decimal('amount', 10, 2); // how much was paid
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_payments');
    }
};
