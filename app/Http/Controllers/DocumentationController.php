<?php

namespace App\Http\Controllers;

use App\Models\Documentation;
use Illuminate\Http\Request;

class DocumentationController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $docs = Documentation::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('publish_date', 'desc')
            ->paginate(20)->withQueryString();

        $total = Documentation::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();

        return view('documentations.index', compact('docs', 'month', 'year', 'total'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        Documentation::create($request->only(['title', 'url', 'publish_date', 'month', 'year', 'notes']));
        return back()->with('success', 'Documentation added successfully.');
    }

    public function update(Request $request, Documentation $documentation)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $documentation->update($request->only(['title', 'url', 'publish_date', 'month', 'year', 'notes']));
        return back()->with('success', 'Documentation updated successfully.');
    }

    public function destroy(Documentation $documentation)
    {
        $documentation->delete();
        return back()->with('success', 'Documentation deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = Documentation::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="documentations.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'url', 'publish_date', 'month', 'year', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [$row->id, $row->title, $row->url, $row->publish_date, $row->month, $row->year, $row->notes]);
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
            $data = array_combine(array_slice($header, 0, count($row)), $row);
            $id   = $data['id'] ?? null;
            $record = [
                'title'        => $data['title'] ?? '',
                'url'          => $data['url'] ?? '',
                'publish_date' => $data['publish_date'] ?? '',
                'month'        => $data['month'] ?? null,
                'year'         => $data['year'] ?? null,
                'notes'        => $data['notes'] ?? '',
            ];
            if ($id) {
                Documentation::updateOrCreate(['id' => $id], $record);
            } else {
                Documentation::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
