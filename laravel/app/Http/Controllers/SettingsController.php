<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = AppSetting::allAsArray();
        return view('settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'primary_color' => 'nullable|string|max:20',
            'accent_color'  => 'nullable|string|max:20',
            'sidebar_bg'    => 'nullable|string|max:20',
            'font_family'   => 'nullable|string|max:50',
            'theme'         => 'nullable|string|in:light,dark',
        ]);

        $keys = ['primary_color', 'accent_color', 'sidebar_bg', 'font_family', 'theme'];
        foreach ($keys as $key) {
            if ($request->has($key)) {
                AppSetting::set($key, $request->input($key));
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Settings saved.']);
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}
