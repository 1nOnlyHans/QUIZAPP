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
        Schema::table('reviewer_items', function (Blueprint $table) {
            $table->dropColumn('definition');
            $table->string('group_name')->nullable()->after('term');
            $table->index(['reviewer_id', 'group_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviewer_items', function (Blueprint $table) {
            $table->dropIndex(['reviewer_id', 'group_name']);
            $table->dropColumn('group_name');
            $table->text('definition')->after('term');
        });
    }
};
