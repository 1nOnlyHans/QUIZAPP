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
        Schema::create('reviewer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_id')->constrained()->cascadeOnDelete();
            $table->string('term');
            $table->text('definition');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index('reviewer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviewer_items');
    }
};
