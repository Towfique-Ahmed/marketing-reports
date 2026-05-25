@extends('layouts.app')

@section('title', 'Dashboard')

@section('topbar-actions')
    <x-month-year-filter />
@endsection

@section('content')
<div class="row g-3 mb-4">
    <!-- Stat Cards -->
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(59,130,246,0.12); color:#3B82F6;">
                    <i class="bi bi-file-earmark-text"></i>
                </div>
                <a href="{{ route('blogs.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['blogs']) }}</div>
            <div class="stat-label">Blog Posts</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(139,92,246,0.12); color:#8B5CF6;">
                    <i class="bi bi-book"></i>
                </div>
                <a href="{{ route('documentations.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['docs']) }}</div>
            <div class="stat-label">Docs</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(16,185,129,0.12); color:#10B981;">
                    <i class="bi bi-share"></i>
                </div>
                <a href="{{ route('social.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['social']) }}</div>
            <div class="stat-label">Social Posts</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(245,158,11,0.12); color:#F59E0B;">
                    <i class="bi bi-people"></i>
                </div>
                <a href="{{ route('community.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['community']) }}</div>
            <div class="stat-label">Community Posts</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(239,68,68,0.12); color:#EF4444;">
                    <i class="bi bi-envelope"></i>
                </div>
                <a href="{{ route('emails.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['emails']) }}</div>
            <div class="stat-label">Email Campaigns</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(6,182,212,0.12); color:#06B6D4;">
                    <i class="bi bi-play-circle"></i>
                </div>
                <a href="{{ route('videos.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['videos']) }}</div>
            <div class="stat-label">Videos</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(236,72,153,0.12); color:#EC4899;">
                    <i class="bi bi-window"></i>
                </div>
                <a href="{{ route('landing-pages.index', ['month'=>$month,'year'=>$year]) }}" class="text-muted small"><i class="bi bi-arrow-right-circle"></i></a>
            </div>
            <div class="stat-value">{{ number_format($stats['landing_pages']) }}</div>
            <div class="stat-label">Landing Pages</div>
        </div>
    </div>
    <div class="col-6 col-sm-4 col-xl-3">
        <div class="stat-card">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="stat-icon" style="background:rgba(99,102,241,0.12); color:#6366F1;">
                    <i class="bi bi-collection"></i>
                </div>
            </div>
            <div class="stat-value">{{ number_format(array_sum($stats)) }}</div>
            <div class="stat-label">Total Content</div>
        </div>
    </div>
</div>

@if($overview)
<div class="row g-3 mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-semibold"><i class="bi bi-calendar3 me-2 text-primary"></i>Monthly Overview — {{ date('F', mktime(0,0,0,$month,1)) }} {{ $year }}</h6>
                <a href="{{ route('monthly-overview', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-primary">Edit</a>
            </div>
            <div class="card-body">
                <div class="row g-3 text-center">
                    <div class="col-6 col-md-3">
                        <div class="fw-bold fs-5">{{ number_format($overview->active_users) }}</div>
                        <div class="text-muted small">Active Users</div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="fw-bold fs-5">{{ number_format($overview->total_clicks) }}</div>
                        <div class="text-muted small">Total Clicks</div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="fw-bold fs-5">{{ number_format($overview->total_impressions) }}</div>
                        <div class="text-muted small">Impressions</div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="fw-bold fs-5">{{ $overview->avg_ctr }}%</div>
                        <div class="text-muted small">Avg CTR</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<div class="row g-3">
    <!-- Chart -->
    <div class="col-lg-8">
        <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-semibold"><i class="bi bi-bar-chart me-2 text-primary"></i>Content Volume (Last 6 Months)</h6>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="contentChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Links -->
    <div class="col-lg-4">
        <div class="card h-100">
            <div class="card-header">
                <h6 class="mb-0 fw-semibold"><i class="bi bi-lightning-charge me-2 text-warning"></i>Quick Links</h6>
            </div>
            <div class="card-body p-0">
                <div class="list-group list-group-flush">
                    <a href="{{ route('blogs.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-file-earmark-text text-primary"></i> Blog Posts
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['blogs'] }}</span>
                    </a>
                    <a href="{{ route('documentations.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-book text-purple"></i> Documentation
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['docs'] }}</span>
                    </a>
                    <a href="{{ route('social.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-share text-success"></i> Social Media
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['social'] }}</span>
                    </a>
                    <a href="{{ route('community.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-people text-warning"></i> Community
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['community'] }}</span>
                    </a>
                    <a href="{{ route('emails.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-envelope text-danger"></i> Email Campaigns
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['emails'] }}</span>
                    </a>
                    <a href="{{ route('videos.index') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-play-circle text-info"></i> Videos
                        <span class="ms-auto badge bg-light text-muted">{{ $stats['videos'] }}</span>
                    </a>
                    <a href="{{ route('analytics') }}" class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 px-4">
                        <i class="bi bi-graph-up-arrow text-primary"></i> Analytics
                        <i class="bi bi-arrow-right ms-auto text-muted"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
const chartData = @json($chartData);

const labels     = chartData.map(d => d.label);
const blogsData  = chartData.map(d => d.blogs);
const docsData   = chartData.map(d => d.docs);
const socialData = chartData.map(d => d.social);
const commData   = chartData.map(d => d.community);
const emailData  = chartData.map(d => d.emails);
const videoData  = chartData.map(d => d.videos);

const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3B82F6';

new Chart(document.getElementById('contentChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [
            { label: 'Blogs',     data: blogsData,  backgroundColor: 'rgba(59,130,246,0.75)' },
            { label: 'Docs',      data: docsData,   backgroundColor: 'rgba(139,92,246,0.75)' },
            { label: 'Social',    data: socialData, backgroundColor: 'rgba(16,185,129,0.75)' },
            { label: 'Community', data: commData,   backgroundColor: 'rgba(245,158,11,0.75)' },
            { label: 'Emails',    data: emailData,  backgroundColor: 'rgba(239,68,68,0.75)' },
            { label: 'Videos',    data: videoData,  backgroundColor: 'rgba(6,182,212,0.75)' },
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    }
});
</script>
@endsection
