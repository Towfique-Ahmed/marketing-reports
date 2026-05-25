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
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('page_url')->default('');
            $table->string('page_type')->default('new');
            $table->string('publish_date')->default('');
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();
            $table->integer('sessions')->default(0);
            $table->integer('conversions')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('bounce_rate', 5, 2)->default(0);
            $table->text('notes')->default('');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
