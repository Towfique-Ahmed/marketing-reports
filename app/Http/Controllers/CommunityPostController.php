<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use Illuminate\Http\Request;

class CommunityPostController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $posts = CommunityPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('post_date', 'desc')
            ->paginate(20)->withQueryString();

        $total = CommunityPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();

        return view('community.index', compact('posts', 'month', 'year', 'total'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        CommunityPost::create($request->only(['title', 'post_date', 'month', 'year', 'url', 'notes']));
        return back()->with('success', 'Community post added successfully.');
    }

    public function update(Request $request, CommunityPost $community)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $community->update($request->only(['title', 'post_date', 'month', 'year', 'url', 'notes']));
        return back()->with('success', 'Community post updated successfully.');
    }

    public function destroy(CommunityPost $community)
    {
        $community->delete();
        return back()->with('success', 'Community post deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = CommunityPost::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="community_posts.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'post_date', 'month', 'year', 'url', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [$row->id, $row->title, $row->post_date, $row->month, $row->year, $row->url, $row->notes]);
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
                'title'     => $data['title'] ?? '',
                'post_date' => $data['post_date'] ?? '',
                'month'     => $data['month'] ?? null,
                'year'      => $data['year'] ?? null,
                'url'       => $data['url'] ?? '',
                'notes'     => $data['notes'] ?? '',
            ];
            if ($id) {
                CommunityPost::updateOrCreate(['id' => $id], $record);
            } else {
                CommunityPost::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
