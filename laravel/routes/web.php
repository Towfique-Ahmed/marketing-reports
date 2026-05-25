<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CommunityPostController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentationController;
use App\Http\Controllers\EmailCampaignController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MonthlyOverviewController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SocialPostController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Blogs
Route::get('blogs/export', [BlogPostController::class, 'csvExport'])->name('blogs.export');
Route::post('blogs/import', [BlogPostController::class, 'csvImport'])->name('blogs.import');
Route::resource('blogs', BlogPostController::class)->only(['index', 'store', 'update', 'destroy']);

// Documentations
Route::get('documentations/export', [DocumentationController::class, 'csvExport'])->name('documentations.export');
Route::post('documentations/import', [DocumentationController::class, 'csvImport'])->name('documentations.import');
Route::resource('documentations', DocumentationController::class)->only(['index', 'store', 'update', 'destroy']);

// Social Posts
Route::get('social/export', [SocialPostController::class, 'csvExport'])->name('social.export');
Route::post('social/import', [SocialPostController::class, 'csvImport'])->name('social.import');
Route::resource('social', SocialPostController::class)->only(['index', 'store', 'update', 'destroy']);

// Community Posts
Route::get('community/export', [CommunityPostController::class, 'csvExport'])->name('community.export');
Route::post('community/import', [CommunityPostController::class, 'csvImport'])->name('community.import');
Route::resource('community', CommunityPostController::class)->only(['index', 'store', 'update', 'destroy']);

// Email Campaigns
Route::get('emails/export', [EmailCampaignController::class, 'csvExport'])->name('emails.export');
Route::post('emails/import', [EmailCampaignController::class, 'csvImport'])->name('emails.import');
Route::resource('emails', EmailCampaignController::class)->only(['index', 'store', 'update', 'destroy']);

// Videos
Route::get('videos/export', [VideoController::class, 'csvExport'])->name('videos.export');
Route::post('videos/import', [VideoController::class, 'csvImport'])->name('videos.import');
Route::resource('videos', VideoController::class)->only(['index', 'store', 'update', 'destroy']);

// Landing Pages
Route::get('landing-pages/export', [LandingPageController::class, 'csvExport'])->name('landing-pages.export');
Route::post('landing-pages/import', [LandingPageController::class, 'csvImport'])->name('landing-pages.import');
Route::resource('landing-pages', LandingPageController::class)->only(['index', 'store', 'update', 'destroy']);

// Monthly Overview
Route::get('monthly-overview', [MonthlyOverviewController::class, 'index'])->name('monthly-overview');
Route::post('monthly-overview', [MonthlyOverviewController::class, 'upsert'])->name('monthly-overview.upsert');

// Analytics
Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics');

// Settings
Route::get('settings', [SettingsController::class, 'index'])->name('settings');
Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
