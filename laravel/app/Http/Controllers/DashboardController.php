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

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $stats = [
            'blogs'          => BlogPost::where('month', $month)->where('year', $year)->count(),
            'docs'           => Documentation::where('month', $month)->where('year', $year)->count(),
            'social'         => SocialPost::where('month', $month)->where('year', $year)->count(),
            'community'      => CommunityPost::where('month', $month)->where('year', $year)->count(),
            'emails'         => EmailCampaign::where('month', $month)->where('year', $year)->count(),
            'videos'         => Video::where('month', $month)->where('year', $year)->count(),
            'landing_pages'  => LandingPage::where('month', $month)->where('year', $year)->count(),
        ];

        $overview = MonthlyOverview::where('month', $month)->where('year', $year)->first();

        // Last 6 months data for bar chart
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $m = (int) $d->month;
            $y = (int) $d->year;
            $chartData[] = [
                'label'     => $d->format('M Y'),
                'blogs'     => BlogPost::where('month', $m)->where('year', $y)->count(),
                'docs'      => Documentation::where('month', $m)->where('year', $y)->count(),
                'social'    => SocialPost::where('month', $m)->where('year', $y)->count(),
                'community' => CommunityPost::where('month', $m)->where('year', $y)->count(),
                'emails'    => EmailCampaign::where('month', $m)->where('year', $y)->count(),
                'videos'    => Video::where('month', $m)->where('year', $y)->count(),
            ];
        }

        return view('dashboard', compact('stats', 'overview', 'chartData', 'month', 'year'));
    }
}
