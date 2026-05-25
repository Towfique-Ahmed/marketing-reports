<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'primary_color' => '#3B82F6',
            'accent_color'  => '#8B5CF6',
            'sidebar_bg'    => '#1e293b',
            'font_family'   => 'Inter',
            'theme'         => 'light',
        ];

        foreach ($defaults as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
