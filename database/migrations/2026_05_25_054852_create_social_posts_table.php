<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('post_date')->default('');
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();
            $table->string('fb_url')->default('');
            $table->string('linkedin_url')->default('');
            $table->string('twitter_url')->default('');
            $table->text('notes')->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_posts');
    }
};
