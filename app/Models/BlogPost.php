<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'url', 'publish_date', 'month', 'year',
        'views', 'rank', 'ai_overview', 'keywords', 'notes',
    ];
}
