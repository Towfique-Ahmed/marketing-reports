<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $q = BlogPost::query();
        if ($month) $q->where('month', $month);
        if ($year)  $q->where('year', $year);
        $posts = $q->orderBy('publish_date', 'desc')->paginate(20)->withQueryString();

        $totalViews = (clone $q->getQuery())->sum('views') ?? 0;
        $avgRank    = BlogPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->where('rank', '>', 0)->avg('rank');

        $total = BlogPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();

        $totalViews = BlogPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->sum('views');

        return view('blogs.index', compact('posts', 'month', 'year', 'total', 'totalViews', 'avgRank'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        BlogPost::create($request->only([
            'title', 'url', 'publish_date', 'month', 'year',
            'views', 'rank', 'ai_overview', 'keywords', 'notes',
        ]));
        return back()->with('success', 'Blog post added successfully.');
    }

    public function update(Request $request, BlogPost $blog)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $blog->update($request->only([
            'title', 'url', 'publish_date', 'month', 'year',
            'views', 'rank', 'ai_overview', 'keywords', 'notes',
        ]));
        return back()->with('success', 'Blog post updated successfully.');
    }

    public function destroy(BlogPost $blog)
    {
        $blog->delete();
        return back()->with('success', 'Blog post deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = BlogPost::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="blogs.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'url', 'publish_date', 'month', 'year', 'views', 'rank', 'ai_overview', 'keywords', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->id, $row->title, $row->url, $row->publish_date,
                    $row->month, $row->year, $row->views, $row->rank,
                    $row->ai_overview, $row->keywords, $row->notes,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function csvImport(Request $request)
    {
        $request->validate(['csv_file' => 'required|file|mimes:csv,txt']);
        $file = $request->file('csv_file');
        $handle = fopen($file->getPathname(), 'r');
        $header = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 2) continue;
            $data = array_combine(array_slice($header, 0, count($row)), $row);
            $id = $data['id'] ?? null;
            $record = [
                'title'        => $data['title'] ?? '',
                'url'          => $data['url'] ?? '',
                'publish_date' => $data['publish_date'] ?? '',
                'month'        => $data['month'] ?? null,
                'year'         => $data['year'] ?? null,
                'views'        => $data['views'] ?? 0,
                'rank'         => $data['rank'] ?? 0,
                'ai_overview'  => $data['ai_overview'] ?? '',
                'keywords'     => $data['keywords'] ?? '',
                'notes'        => $data['notes'] ?? '',
            ];
            if ($id) {
                BlogPost::updateOrCreate(['id' => $id], $record);
            } else {
                BlogPost::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
