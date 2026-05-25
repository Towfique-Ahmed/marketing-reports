@extends('layouts.app')

@section('title', 'Analytics')

@section('topbar-actions')
    <form method="GET" action="{{ route('analytics') }}" class="d-flex align-items-center gap-2">
        <label class="form-label mb-0 fw-medium">Year:</label>
        <select name="year" class="form-select form-select-sm" style="width:auto;" onchange="this.form.submit()">
            @foreach(range(now()->year, now()->year - 4) as $y)
            <option value="{{ $y }}" {{ $y == $year ? 'selected' : '' }}>{{ $y }}</option>
            @endforeach
        </select>
    </form>
@endsection

@section('content')
<!-- Section 1: Content Volume -->
<div class="card mb-4">
    <div class="card-header d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-bar-chart-fill me-2 text-primary"></i>Content Volume by Month</h6>
        <small class="text-muted">{{ $year }}</small>
    </div>
    <div class="card-body">
        <div class="chart-container" style="height:320px;">
            <canvas id="contentVolumeChart"></canvas>
        </div>
    </div>
</div>

<!-- Section 2: Site Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-globe me-2 text-success"></i>Site Performance</h6>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">Active Users & New Users</p>
                <div class="chart-container" style="height:240px;"><canvas id="usersChart"></canvas></div>
            </div>
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">Clicks & Impressions</p>
                <div class="chart-container" style="height:240px;"><canvas id="clicksChart"></canvas></div>
            </div>
        </div>
    </div>
</div>

<!-- Section 3: Email Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-envelope me-2 text-danger"></i>Email Campaign Performance</h6>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">Open Rate & Click Rate (%)</p>
                <div class="chart-container" style="height:240px;"><canvas id="emailRatesChart"></canvas></div>
            </div>
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">Total Recipients</p>
                <div class="chart-container" style="height:240px;"><canvas id="recipientsChart"></canvas></div>
            </div>
        </div>
    </div>
</div>

<!-- Section 4: YouTube Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-youtube me-2 text-danger"></i>YouTube Performance</h6>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">YouTube Views & Subscribers</p>
                <div class="chart-container" style="height:240px;"><canvas id="ytChart"></canvas></div>
            </div>
            <div class="col-md-6">
                <p class="text-muted small fw-medium mb-1">Watch Time (Hours)</p>
                <div class="chart-container" style="height:240px;"><canvas id="ytWatchChart"></canvas></div>
            </div>
        </div>
    </div>
</div>

<!-- Section 5: LinkedIn Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-linkedin me-2" style="color:#0077b5;"></i>LinkedIn Performance</h6>
    </div>
    <div class="card-body">
        <div class="chart-container" style="height:280px;">
            <canvas id="linkedinChart"></canvas>
        </div>
    </div>
</div>

<!-- Section 6: Facebook Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-facebook me-2 text-primary"></i>Facebook Performance</h6>
    </div>
    <div class="card-body">
        <div class="chart-container" style="height:280px;">
            <canvas id="facebookChart"></canvas>
        </div>
    </div>
</div>

<!-- Section 7: Twitter Performance -->
<div class="card mb-4">
    <div class="card-header">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-twitter-x me-2"></i>Twitter/X Performance</h6>
    </div>
    <div class="card-body">
        <div class="chart-container" style="height:280px;">
            <canvas id="twitterChart"></canvas>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
const labels     = @json($labels);
const contentData = @json($contentData);
const sitePerf   = @json($sitePerf);
const emailPerf  = @json($emailPerf);
const ytPerf     = @json($ytPerf);
const liPerf     = @json($liPerf);
const fbPerf     = @json($fbPerf);
const twPerf     = @json($twPerf);

const defaultOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true }
    }
};

// 1. Content Volume Chart
new Chart(document.getElementById('contentVolumeChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [
            { label: 'Blogs',     data: contentData.map(d=>d.blogs),     backgroundColor: 'rgba(59,130,246,0.75)' },
            { label: 'Docs',      data: contentData.map(d=>d.docs),      backgroundColor: 'rgba(139,92,246,0.75)' },
            { label: 'Social',    data: contentData.map(d=>d.social),    backgroundColor: 'rgba(16,185,129,0.75)' },
            { label: 'Community', data: contentData.map(d=>d.community), backgroundColor: 'rgba(245,158,11,0.75)' },
            { label: 'Emails',    data: contentData.map(d=>d.emails),    backgroundColor: 'rgba(239,68,68,0.75)' },
            { label: 'Videos',    data: contentData.map(d=>d.videos),    backgroundColor: 'rgba(6,182,212,0.75)' },
        ]
    },
    options: { ...defaultOpts, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } } }
});

// 2. Users Chart
new Chart(document.getElementById('usersChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Active Users', data: sitePerf.map(d=>d.active_users), borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3 },
            { label: 'New Users',    data: sitePerf.map(d=>d.new_users),    borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 },
        ]
    },
    options: defaultOpts
});

// Clicks Chart
new Chart(document.getElementById('clicksChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Clicks',      data: sitePerf.map(d=>d.total_clicks),      borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.3 },
            { label: 'Impressions', data: sitePerf.map(d=>d.total_impressions), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)',  fill: true, tension: 0.3 },
        ]
    },
    options: defaultOpts
});

// 3. Email Rates Chart
new Chart(document.getElementById('emailRatesChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Open Rate (%)',  data: emailPerf.map(d=>parseFloat(d.open_rate).toFixed(2)),  borderColor: '#10B981', tension: 0.3, fill: false },
            { label: 'Click Rate (%)', data: emailPerf.map(d=>parseFloat(d.click_rate).toFixed(2)), borderColor: '#3B82F6', tension: 0.3, fill: false },
        ]
    },
    options: defaultOpts
});

// Recipients Chart
new Chart(document.getElementById('recipientsChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [
            { label: 'Recipients', data: emailPerf.map(d=>d.recipients), backgroundColor: 'rgba(239,68,68,0.75)' }
        ]
    },
    options: defaultOpts
});

// 4. YouTube Charts
new Chart(document.getElementById('ytChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [
            { label: 'Views',       data: ytPerf.map(d=>d.yt_views),       backgroundColor: 'rgba(239,68,68,0.7)', yAxisID: 'y' },
            { label: 'Subscribers', data: ytPerf.map(d=>d.yt_subscribers), backgroundColor: 'rgba(245,158,11,0.7)', yAxisID: 'y1' },
        ]
    },
    options: { ...defaultOpts, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, position: 'left' }, y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } } } }
});

new Chart(document.getElementById('ytWatchChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [
            { label: 'Watch Time (hrs)', data: ytPerf.map(d=>d.yt_watch_time), backgroundColor: 'rgba(239,68,68,0.75)' }
        ]
    },
    options: defaultOpts
});

// 5. LinkedIn Chart
new Chart(document.getElementById('linkedinChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Impressions', data: liPerf.map(d=>d.li_impressions), borderColor: '#0077b5', tension: 0.3, fill: false },
            { label: 'Reactions',   data: liPerf.map(d=>d.li_reactions),   borderColor: '#10B981', tension: 0.3, fill: false },
            { label: 'Reposts',     data: liPerf.map(d=>d.li_reposts),     borderColor: '#8B5CF6', tension: 0.3, fill: false },
            { label: 'Followers',   data: liPerf.map(d=>d.li_followers),   borderColor: '#F59E0B', tension: 0.3, fill: false },
        ]
    },
    options: defaultOpts
});

// 6. Facebook Chart
new Chart(document.getElementById('facebookChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Visits',       data: fbPerf.map(d=>d.fb_visits),       borderColor: '#1877f2', tension: 0.3, fill: false },
            { label: 'Reach',        data: fbPerf.map(d=>d.fb_reach),        borderColor: '#10B981', tension: 0.3, fill: false },
            { label: 'Interactions', data: fbPerf.map(d=>d.fb_interactions), borderColor: '#F59E0B', tension: 0.3, fill: false },
        ]
    },
    options: defaultOpts
});

// 7. Twitter Chart
new Chart(document.getElementById('twitterChart'), {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'Impressions',  data: twPerf.map(d=>d.tw_impressions),  borderColor: '#1da1f2', tension: 0.3, fill: false },
            { label: 'Engagements',  data: twPerf.map(d=>d.tw_engagements),  borderColor: '#10B981', tension: 0.3, fill: false },
            { label: 'Eng. Rate (%)',data: twPerf.map(d=>d.tw_engagement_rate), borderColor: '#F59E0B', tension: 0.3, fill: false },
        ]
    },
    options: defaultOpts
});
</script>
@endsection
