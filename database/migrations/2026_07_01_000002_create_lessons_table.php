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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('material_type', 20);
            $table->string('file_disk')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('external_url')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'academic_period_id']);
            $table->index('material_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
