<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CommunityPost;
use App\Models\Documentation;
use App\Models\EmailCampaign;
use App\Models\LandingPage;
use App\Models\MonthlyOverview;
use App\Models\SocialPost;
use App\Models\Video;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', now()->year);

        // Build 12-month label array
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'label' => date('M', mktime(0, 0, 0, $m, 1)) . ' ' . $year,
                'month' => $m,
                'year'  => $year,
            ];
        }

        $labels = array_column($months, 'label');

        // Content volume per month
        $contentData = [];
        foreach ($months as $mo) {
            $m = $mo['month'];
            $y = $mo['year'];
            $contentData[] = [
                'blogs'     => BlogPost::where('month', $m)->where('year', $y)->count(),
                'docs'      => Documentation::where('month', $m)->where('year', $y)->count(),
                'social'    => SocialPost::where('month', $m)->where('year', $y)->count(),
                'community' => CommunityPost::where('month', $m)->where('year', $y)->count(),
                'emails'    => EmailCampaign::where('month', $m)->where('year', $y)->count(),
                'videos'    => Video::where('month', $m)->where('year', $y)->count(),
            ];
        }

        // Monthly overview data
        $overviews = MonthlyOverview::where('year', $year)->orderBy('month')->get()->keyBy('month');

        $sitePerf   = [];
        $emailPerf  = [];
        $ytPerf     = [];
        $liPerf     = [];
        $fbPerf     = [];
        $twPerf     = [];

        for ($m = 1; $m <= 12; $m++) {
            $ov = $overviews->get($m);
            $sitePerf[] = [
                'active_users'       => $ov ? $ov->active_users : 0,
                'new_users'          => $ov ? $ov->new_users : 0,
                'total_clicks'       => $ov ? $ov->total_clicks : 0,
                'total_impressions'  => $ov ? $ov->total_impressions : 0,
                'avg_ctr'            => $ov ? $ov->avg_ctr : 0,
                'avg_position'       => $ov ? $ov->avg_position : 0,
            ];
            $emailPerf[] = [
                'open_rate'   => EmailCampaign::where('month', $m)->where('year', $year)->avg('open_rate') ?? 0,
                'click_rate'  => EmailCampaign::where('month', $m)->where('year', $year)->avg('click_rate') ?? 0,
                'recipients'  => EmailCampaign::where('month', $m)->where('year', $year)->sum('recipients'),
            ];
            $ytPerf[] = [
                'yt_views'       => $ov ? $ov->yt_views : 0,
                'yt_watch_time'  => $ov ? $ov->yt_watch_time : 0,
                'yt_subscribers' => $ov ? $ov->yt_subscribers : 0,
            ];
            $liPerf[] = [
                'li_impressions'  => $ov ? $ov->li_impressions : 0,
                'li_reactions'    => $ov ? $ov->li_reactions : 0,
                'li_reposts'      => $ov ? $ov->li_reposts : 0,
                'li_followers'    => $ov ? $ov->li_followers : 0,
            ];
            $fbPerf[] = [
                'fb_visits'       => $ov ? $ov->fb_visits : 0,
                'fb_reach'        => $ov ? $ov->fb_reach : 0,
                'fb_interactions' => $ov ? $ov->fb_interactions : 0,
            ];
            $twPerf[] = [
                'tw_impressions'    => $ov ? $ov->tw_impressions : 0,
                'tw_engagements'    => $ov ? $ov->tw_engagements : 0,
                'tw_engagement_rate'=> $ov ? $ov->tw_engagement_rate : 0,
            ];
        }

        return view('analytics.index', compact(
            'labels', 'contentData', 'sitePerf', 'emailPerf',
            'ytPerf', 'liPerf', 'fbPerf', 'twPerf', 'year'
        ));
    }
}
