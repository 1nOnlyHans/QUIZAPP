<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(true);
            $table->timestamps();
        });

        $timestamp = now();

        DB::table('academic_periods')->insert([
            [
                'name' => 'All',
                'slug' => 'all',
                'sort_order' => 10,
                'is_system' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Prelims',
                'slug' => 'prelims',
                'sort_order' => 20,
                'is_system' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Midterm',
                'slug' => 'midterm',
                'sort_order' => 30,
                'is_system' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Pre-Finals',
                'slug' => 'pre-finals',
                'sort_order' => 40,
                'is_system' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Finals',
                'slug' => 'finals',
                'sort_order' => 50,
                'is_system' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_periods');
    }
};
