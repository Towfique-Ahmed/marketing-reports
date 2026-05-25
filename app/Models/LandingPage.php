<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model
{
    protected $fillable = [
        'title', 'page_url', 'page_type', 'publish_date', 'month', 'year',
        'sessions', 'conversions', 'conversion_rate', 'bounce_rate', 'notes',
    ];
}
