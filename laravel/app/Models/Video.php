<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $fillable = [
        'title', 'platform', 'video_url', 'publish_date', 'month', 'year',
        'views', 'watch_time_hours', 'likes', 'comments', 'shares', 'notes',
    ];
}
