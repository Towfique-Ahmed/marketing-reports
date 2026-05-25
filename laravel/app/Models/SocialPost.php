<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    protected $fillable = [
        'title', 'post_date', 'month', 'year',
        'fb_url', 'linkedin_url', 'twitter_url', 'notes',
    ];
}
