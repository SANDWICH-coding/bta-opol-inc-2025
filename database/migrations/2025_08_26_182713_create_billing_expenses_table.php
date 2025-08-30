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
        Schema::create('billing_expenses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('school_year_id')
                ->constrained('school_years')
                ->onDelete('cascade');

            $table->string('expense_category');
            $table->string('vendor_merchant');
            $table->date('expense_date');
            $table->string('receipt_number');
            $table->decimal('amount', 10, 2);
            $table->string('remarks');
            $table->string('responsible');
            $table->string('receipt_photo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_expenses');
    }
};
