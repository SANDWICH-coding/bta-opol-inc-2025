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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('lrn')->nullable();
            $table->string('lastName');
            $table->string('firstName');
            $table->string('middleName')->nullable();
            $table->string('suffix')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->date('birthDate')->nullable();
            $table->string('profilePhoto')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
