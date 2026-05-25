<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $videos = Video::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('publish_date', 'desc')
            ->paginate(20)->withQueryString();

        $total      = Video::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();
        $totalViews = Video::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->sum('views');
        $totalWatch = Video::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->sum('watch_time_hours');

        return view('videos.index', compact('videos', 'month', 'year', 'total', 'totalViews', 'totalWatch'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        Video::create($request->only([
            'title', 'platform', 'video_url', 'publish_date', 'month', 'year',
            'views', 'watch_time_hours', 'likes', 'comments', 'shares', 'notes',
        ]));
        return back()->with('success', 'Video added successfully.');
    }

    public function update(Request $request, Video $video)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $video->update($request->only([
            'title', 'platform', 'video_url', 'publish_date', 'month', 'year',
            'views', 'watch_time_hours', 'likes', 'comments', 'shares', 'notes',
        ]));
        return back()->with('success', 'Video updated successfully.');
    }

    public function destroy(Video $video)
    {
        $video->delete();
        return back()->with('success', 'Video deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = Video::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="videos.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'platform', 'video_url', 'publish_date', 'month', 'year', 'views', 'watch_time_hours', 'likes', 'comments', 'shares', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->id, $row->title, $row->platform, $row->video_url,
                    $row->publish_date, $row->month, $row->year,
                    $row->views, $row->watch_time_hours, $row->likes,
                    $row->comments, $row->shares, $row->notes,
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
                'title'            => $data['title'] ?? '',
                'platform'         => $data['platform'] ?? 'YouTube',
                'video_url'        => $data['video_url'] ?? '',
                'publish_date'     => $data['publish_date'] ?? '',
                'month'            => $data['month'] ?? null,
                'year'             => $data['year'] ?? null,
                'views'            => $data['views'] ?? 0,
                'watch_time_hours' => $data['watch_time_hours'] ?? 0,
                'likes'            => $data['likes'] ?? 0,
                'comments'         => $data['comments'] ?? 0,
                'shares'           => $data['shares'] ?? 0,
                'notes'            => $data['notes'] ?? '',
            ];
            if ($id) {
                Video::updateOrCreate(['id' => $id], $record);
            } else {
                Video::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
