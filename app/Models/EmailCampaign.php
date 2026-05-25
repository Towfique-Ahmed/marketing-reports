<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    protected $fillable = [
        'campaign_name', 'send_date', 'month', 'year',
        'recipients', 'open_rate', 'click_rate', 'notes',
    ];
}
