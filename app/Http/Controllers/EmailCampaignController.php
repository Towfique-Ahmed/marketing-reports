<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use Illuminate\Http\Request;

class EmailCampaignController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $campaigns = EmailCampaign::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('send_date', 'desc')
            ->paginate(20)->withQueryString();

        $total      = EmailCampaign::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();
        $totalSent  = EmailCampaign::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->sum('recipients');
        $avgOpen    = EmailCampaign::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->avg('open_rate');
        $avgClick   = EmailCampaign::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->avg('click_rate');

        return view('emails.index', compact('campaigns', 'month', 'year', 'total', 'totalSent', 'avgOpen', 'avgClick'));
    }

    public function store(Request $request)
    {
        $request->validate(['campaign_name' => 'required|string|max:500']);
        EmailCampaign::create($request->only([
            'campaign_name', 'send_date', 'month', 'year',
            'recipients', 'open_rate', 'click_rate', 'notes',
        ]));
        return back()->with('success', 'Email campaign added successfully.');
    }

    public function update(Request $request, EmailCampaign $email)
    {
        $request->validate(['campaign_name' => 'required|string|max:500']);
        $email->update($request->only([
            'campaign_name', 'send_date', 'month', 'year',
            'recipients', 'open_rate', 'click_rate', 'notes',
        ]));
        return back()->with('success', 'Email campaign updated successfully.');
    }

    public function destroy(EmailCampaign $email)
    {
        $email->delete();
        return back()->with('success', 'Email campaign deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = EmailCampaign::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="email_campaigns.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'campaign_name', 'send_date', 'month', 'year', 'recipients', 'open_rate', 'click_rate', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->id, $row->campaign_name, $row->send_date,
                    $row->month, $row->year, $row->recipients,
                    $row->open_rate, $row->click_rate, $row->notes,
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
                'campaign_name' => $data['campaign_name'] ?? '',
                'send_date'     => $data['send_date'] ?? '',
                'month'         => $data['month'] ?? null,
                'year'          => $data['year'] ?? null,
                'recipients'    => $data['recipients'] ?? 0,
                'open_rate'     => $data['open_rate'] ?? 0,
                'click_rate'    => $data['click_rate'] ?? 0,
                'notes'         => $data['notes'] ?? '',
            ];
            if ($id) {
                EmailCampaign::updateOrCreate(['id' => $id], $record);
            } else {
                EmailCampaign::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
