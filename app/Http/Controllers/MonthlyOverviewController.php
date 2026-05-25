<?php

namespace App\Http\Controllers;

use App\Models\MonthlyOverview;
use Illuminate\Http\Request;

class MonthlyOverviewController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $overview = MonthlyOverview::where('month', $month)->where('year', $year)->first();

        return view('monthly-overview.index', compact('overview', 'month', 'year'));
    }

    public function upsert(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year  = $request->input('year', now()->year);

        $data = $request->except(['_token', '_method']);

        MonthlyOverview::updateOrCreate(
            ['month' => $month, 'year' => $year],
            $data
        );

        return back()->with('success', 'Monthly overview saved successfully.');
    }
}
