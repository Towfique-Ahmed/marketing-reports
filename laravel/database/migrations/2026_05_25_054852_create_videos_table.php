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
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('platform')->default('YouTube');
            $table->string('video_url')->default('');
            $table->string('publish_date')->default('');
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();
            $table->integer('views')->default(0);
            $table->decimal('watch_time_hours', 8, 2)->default(0);
            $table->integer('likes')->default(0);
            $table->integer('comments')->default(0);
            $table->integer('shares')->default(0);
            $table->text('notes')->default('');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
