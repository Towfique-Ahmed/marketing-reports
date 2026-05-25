<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityPost extends Model
{
    protected $fillable = [
        'title', 'post_date', 'month', 'year', 'url', 'notes',
    ];
}
