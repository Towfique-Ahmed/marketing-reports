<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyOverview extends Model
{
    protected $table = 'monthly_overview';

    protected $fillable = [
        'month', 'year', 'active_users', 'new_users', 'total_clicks', 'total_impressions',
        'avg_ctr', 'avg_position', 'yt_views', 'yt_watch_time', 'yt_subscribers',
        'community_prev', 'community_new', 'community_total',
        'li_impressions', 'li_reactions', 'li_comments', 'li_reposts',
        'li_page_views', 'li_unique_visitors', 'li_button_clicks', 'li_followers', 'li_search_appearance',
        'fb_visits', 'fb_views', 'fb_reach', 'fb_interactions', 'fb_link_clicks', 'fb_follows',
        'tw_impressions', 'tw_engagement_rate', 'tw_engagements', 'tw_profile_visits',
        'tw_replies', 'tw_likes', 'tw_reposts', 'tw_bookmarks', 'tw_shares',
        'notes',
    ];
}
