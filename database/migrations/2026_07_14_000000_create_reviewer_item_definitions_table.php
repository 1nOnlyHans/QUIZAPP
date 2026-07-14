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
        Schema::create('reviewer_item_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_item_id')->constrained()->cascadeOnDelete();
            $table->text('definition');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['reviewer_item_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviewer_item_definitions');
    }
};
