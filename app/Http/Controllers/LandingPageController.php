<?php

namespace App\Http\Controllers;

use App\Models\LandingPage;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $pages = LandingPage::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('publish_date', 'desc')
            ->paginate(20)->withQueryString();

        $total       = LandingPage::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();
        $totalSess   = LandingPage::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->sum('sessions');
        $avgConvRate = LandingPage::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->avg('conversion_rate');

        return view('landing-pages.index', compact('pages', 'month', 'year', 'total', 'totalSess', 'avgConvRate'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        LandingPage::create($request->only([
            'title', 'page_url', 'page_type', 'publish_date', 'month', 'year',
            'sessions', 'conversions', 'conversion_rate', 'bounce_rate', 'notes',
        ]));
        return back()->with('success', 'Landing page added successfully.');
    }

    public function update(Request $request, LandingPage $landingPage)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $landingPage->update($request->only([
            'title', 'page_url', 'page_type', 'publish_date', 'month', 'year',
            'sessions', 'conversions', 'conversion_rate', 'bounce_rate', 'notes',
        ]));
        return back()->with('success', 'Landing page updated successfully.');
    }

    public function destroy(LandingPage $landingPage)
    {
        $landingPage->delete();
        return back()->with('success', 'Landing page deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = LandingPage::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="landing_pages.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'page_url', 'page_type', 'publish_date', 'month', 'year', 'sessions', 'conversions', 'conversion_rate', 'bounce_rate', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->id, $row->title, $row->page_url, $row->page_type,
                    $row->publish_date, $row->month, $row->year,
                    $row->sessions, $row->conversions, $row->conversion_rate,
                    $row->bounce_rate, $row->notes,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function csvImport(Request $request)
    {
        $request->validate(['csv_file' => 'required|file|mimes:csv,txt']);
        $file   = $request->file('csv_file');
        $handle = fopen($file->getPathname(), 'r');
        $header = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 2) continue;
            $data   = array_combine(array_slice($header, 0, count($row)), $row);
            $id     = $data['id'] ?? null;
            $record = [
                'title'           => $data['title'] ?? '',
                'page_url'        => $data['page_url'] ?? '',
                'page_type'       => $data['page_type'] ?? 'new',
                'publish_date'    => $data['publish_date'] ?? '',
                'month'           => $data['month'] ?? null,
                'year'            => $data['year'] ?? null,
                'sessions'        => $data['sessions'] ?? 0,
                'conversions'     => $data['conversions'] ?? 0,
                'conversion_rate' => $data['conversion_rate'] ?? 0,
                'bounce_rate'     => $data['bounce_rate'] ?? 0,
                'notes'           => $data['notes'] ?? '',
            ];
            if ($id) {
                LandingPage::updateOrCreate(['id' => $id], $record);
            } else {
                LandingPage::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
