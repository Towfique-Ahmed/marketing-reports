<?php

namespace App\Http\Controllers;

use App\Models\SocialPost;
use Illuminate\Http\Request;

class SocialPostController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month');
        $year  = $request->get('year');

        $posts = SocialPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->orderBy('post_date', 'desc')
            ->paginate(20)->withQueryString();

        $total    = SocialPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->count();
        $withFb   = SocialPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->whereNotNull('fb_url')->where('fb_url', '!=', '')->count();
        $withLi   = SocialPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->whereNotNull('linkedin_url')->where('linkedin_url', '!=', '')->count();
        $withTw   = SocialPost::query()
            ->when($month, fn($q) => $q->where('month', $month))
            ->when($year,  fn($q) => $q->where('year', $year))
            ->whereNotNull('twitter_url')->where('twitter_url', '!=', '')->count();

        return view('social.index', compact('posts', 'month', 'year', 'total', 'withFb', 'withLi', 'withTw'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);
        SocialPost::create($request->only(['title', 'post_date', 'month', 'year', 'fb_url', 'linkedin_url', 'twitter_url', 'notes']));
        return back()->with('success', 'Social post added successfully.');
    }

    public function update(Request $request, SocialPost $social)
    {
        $request->validate(['title' => 'required|string|max:500']);
        $social->update($request->only(['title', 'post_date', 'month', 'year', 'fb_url', 'linkedin_url', 'twitter_url', 'notes']));
        return back()->with('success', 'Social post updated successfully.');
    }

    public function destroy(SocialPost $social)
    {
        $social->delete();
        return back()->with('success', 'Social post deleted.');
    }

    public function csvExport(Request $request)
    {
        $q = SocialPost::query();
        if ($request->month) $q->where('month', $request->month);
        if ($request->year)  $q->where('year', $request->year);
        $rows = $q->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="social_posts.csv"',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'title', 'post_date', 'month', 'year', 'fb_url', 'linkedin_url', 'twitter_url', 'notes']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->id, $row->title, $row->post_date, $row->month, $row->year,
                    $row->fb_url, $row->linkedin_url, $row->twitter_url, $row->notes,
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
                'title'        => $data['title'] ?? '',
                'post_date'    => $data['post_date'] ?? '',
                'month'        => $data['month'] ?? null,
                'year'         => $data['year'] ?? null,
                'fb_url'       => $data['fb_url'] ?? '',
                'linkedin_url' => $data['linkedin_url'] ?? '',
                'twitter_url'  => $data['twitter_url'] ?? '',
                'notes'        => $data['notes'] ?? '',
            ];
            if ($id) {
                SocialPost::updateOrCreate(['id' => $id], $record);
            } else {
                SocialPost::create($record);
            }
        }
        fclose($handle);

        return back()->with('success', 'CSV imported successfully.');
    }
}
