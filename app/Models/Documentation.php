<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Documentation extends Model
{
    protected $fillable = [
        'title', 'url', 'publish_date', 'month', 'year', 'notes',
    ];
}
