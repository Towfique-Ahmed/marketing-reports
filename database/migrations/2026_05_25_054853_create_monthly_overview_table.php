<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_overview', function (Blueprint $table) {
            $table->id();
            $table->integer('month');
            $table->integer('year');
            $table->integer('active_users')->default(0);
            $table->integer('new_users')->default(0);
            $table->integer('total_clicks')->default(0);
            $table->integer('total_impressions')->default(0);
            $table->decimal('avg_ctr', 5, 2)->default(0);
            $table->decimal('avg_position', 5, 2)->default(0);
            $table->integer('yt_views')->default(0);
            $table->decimal('yt_watch_time', 8, 2)->default(0);
            $table->integer('yt_subscribers')->default(0);
            $table->integer('community_prev')->default(0);
            $table->integer('community_new')->default(0);
            $table->integer('community_total')->default(0);
            $table->integer('li_impressions')->default(0);
            $table->integer('li_reactions')->default(0);
            $table->integer('li_comments')->default(0);
            $table->integer('li_reposts')->default(0);
            $table->integer('li_page_views')->default(0);
            $table->integer('li_unique_visitors')->default(0);
            $table->integer('li_button_clicks')->default(0);
            $table->integer('li_followers')->default(0);
            $table->integer('li_search_appearance')->default(0);
            $table->integer('fb_visits')->default(0);
            $table->integer('fb_views')->default(0);
            $table->integer('fb_reach')->default(0);
            $table->integer('fb_interactions')->default(0);
            $table->integer('fb_link_clicks')->default(0);
            $table->integer('fb_follows')->default(0);
            $table->integer('tw_impressions')->default(0);
            $table->decimal('tw_engagement_rate', 5, 2)->default(0);
            $table->integer('tw_engagements')->default(0);
            $table->integer('tw_profile_visits')->default(0);
            $table->integer('tw_replies')->default(0);
            $table->integer('tw_likes')->default(0);
            $table->integer('tw_reposts')->default(0);
            $table->integer('tw_bookmarks')->default(0);
            $table->integer('tw_shares')->default(0);
            $table->text('notes')->default('');
            $table->timestamps();
            $table->unique(['month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_overview');
    }
};
