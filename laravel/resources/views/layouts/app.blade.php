<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Marketing Reports') – Marketing Hub</title>

    <!-- Google Fonts -->
    @php
        $settings = \App\Models\AppSetting::allAsArray();
        $fontFamily = $settings['font_family'] ?? 'Inter';
        $primaryColor = $settings['primary_color'] ?? '#3B82F6';
        $accentColor = $settings['accent_color'] ?? '#8B5CF6';
        $sidebarBg = $settings['sidebar_bg'] ?? '#1e293b';
    @endphp
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Nunito:wght@300;400;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Bootstrap 5.3 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

    <style>
        :root {
            --color-primary: {{ $primaryColor }};
            --color-accent: {{ $accentColor }};
            --color-sidebar-bg: {{ $sidebarBg }};
            --font-family: '{{ $fontFamily }}', system-ui, sans-serif;
        }

        * { box-sizing: border-box; }

        body {
            font-family: var(--font-family);
            background-color: #f1f5f9;
            color: #334155;
        }

        /* Sidebar */
        .sidebar {
            background-color: var(--color-sidebar-bg);
            min-height: 100vh;
            width: 260px;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1040;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease;
            overflow-y: auto;
        }

        .sidebar-brand {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-brand h4 {
            color: #fff;
            font-weight: 700;
            margin: 0;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
        }

        .sidebar-brand span {
            color: var(--color-primary);
        }

        .sidebar-nav {
            padding: 1rem 0;
            flex: 1;
        }

        .sidebar-label {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.35);
            padding: 0.75rem 1.5rem 0.25rem;
        }

        .sidebar .nav-link {
            color: rgba(255,255,255,0.65);
            padding: 0.55rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 400;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            border-radius: 0;
            transition: all 0.15s;
            text-decoration: none;
            border-left: 3px solid transparent;
        }

        .sidebar .nav-link:hover {
            color: #fff;
            background: rgba(255,255,255,0.06);
            border-left-color: var(--color-primary);
        }

        .sidebar .nav-link.active {
            color: #fff !important;
            background: rgba(255,255,255,0.1);
            border-left-color: var(--color-primary);
            font-weight: 500;
        }

        .sidebar .nav-link i {
            font-size: 1rem;
            width: 20px;
            text-align: center;
            opacity: 0.8;
        }

        .sidebar .nav-link.active i {
            color: var(--color-primary);
            opacity: 1;
        }

        /* Main content */
        .main-wrapper {
            margin-left: 260px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Top bar */
        .topbar {
            background: #fff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.875rem 1.5rem;
            position: sticky;
            top: 0;
            z-index: 1030;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }

        .topbar-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
        }

        .topbar-right {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        /* Content */
        .content-area {
            padding: 1.5rem;
            flex: 1;
        }

        /* Stat Cards */
        .stat-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
            border: 1px solid #e2e8f0;
            height: 100%;
        }

        .stat-card .stat-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .stat-card .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.2;
        }

        .stat-card .stat-label {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Cards */
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .card-header {
            background: #fff;
            border-bottom: 1px solid #e2e8f0;
            padding: 1rem 1.25rem;
            border-radius: 12px 12px 0 0 !important;
        }

        /* Buttons */
        .btn-primary {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
        }

        .btn-primary:hover,
        .btn-primary:focus {
            background-color: color-mix(in srgb, var(--color-primary) 85%, black);
            border-color: color-mix(in srgb, var(--color-primary) 85%, black);
        }

        .btn-outline-primary {
            color: var(--color-primary);
            border-color: var(--color-primary);
        }

        .btn-outline-primary:hover {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
            color: #fff;
        }

        /* Tables */
        .table {
            font-size: 0.875rem;
        }

        .table thead th {
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
            white-space: nowrap;
        }

        .table-hover tbody tr:hover {
            background-color: #f8fafc;
        }

        /* Badges */
        .badge-primary {
            background-color: color-mix(in srgb, var(--color-primary) 15%, white);
            color: var(--color-primary);
        }

        /* Mobile toggle */
        .sidebar-toggle {
            display: none;
            background: none;
            border: none;
            font-size: 1.4rem;
            color: #475569;
            cursor: pointer;
            padding: 0.25rem;
        }

        @media (max-width: 991.98px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.show {
                transform: translateX(0);
            }

            .main-wrapper {
                margin-left: 0;
            }

            .sidebar-toggle {
                display: block;
            }

            .sidebar-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1039;
            }

            .sidebar-overlay.show {
                display: block;
            }
        }

        /* Pagination */
        .pagination .page-link {
            color: var(--color-primary);
            border-color: #e2e8f0;
        }

        .pagination .page-item.active .page-link {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
        }

        /* Chart container */
        .chart-container {
            position: relative;
            height: 300px;
        }

        /* Color swatch */
        .color-swatch {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: inline-block;
            vertical-align: middle;
            cursor: pointer;
        }

        @yield('extra-styles')
    </style>
</head>
<body>

<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Sidebar -->
<nav class="sidebar" id="sidebar">
    <div class="sidebar-brand">
        <h4><i class="bi bi-bar-chart-fill me-2" style="color: var(--color-primary);"></i><span>Marketing</span> Hub</h4>
        <div style="font-size:0.72rem; color:rgba(255,255,255,0.4); margin-top:2px;">Reports & Analytics</div>
    </div>

    <div class="sidebar-nav">
        <div class="sidebar-label">Main</div>
        <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>

        <div class="sidebar-label">Content</div>
        <a href="{{ route('blogs.index') }}" class="nav-link {{ request()->routeIs('blogs.*') ? 'active' : '' }}">
            <i class="bi bi-file-earmark-text"></i> Blogs
        </a>
        <a href="{{ route('documentations.index') }}" class="nav-link {{ request()->routeIs('documentations.*') ? 'active' : '' }}">
            <i class="bi bi-book"></i> Documentation
        </a>
        <a href="{{ route('videos.index') }}" class="nav-link {{ request()->routeIs('videos.*') ? 'active' : '' }}">
            <i class="bi bi-play-circle"></i> Videos
        </a>
        <a href="{{ route('landing-pages.index') }}" class="nav-link {{ request()->routeIs('landing-pages.*') ? 'active' : '' }}">
            <i class="bi bi-window"></i> Landing Pages
        </a>

        <div class="sidebar-label">Social & Community</div>
        <a href="{{ route('social.index') }}" class="nav-link {{ request()->routeIs('social.*') ? 'active' : '' }}">
            <i class="bi bi-share"></i> Social Media
        </a>
        <a href="{{ route('community.index') }}" class="nav-link {{ request()->routeIs('community.*') ? 'active' : '' }}">
            <i class="bi bi-people"></i> Community
        </a>

        <div class="sidebar-label">Campaigns</div>
        <a href="{{ route('emails.index') }}" class="nav-link {{ request()->routeIs('emails.*') ? 'active' : '' }}">
            <i class="bi bi-envelope"></i> Email Campaigns
        </a>

        <div class="sidebar-label">Reporting</div>
        <a href="{{ route('monthly-overview') }}" class="nav-link {{ request()->routeIs('monthly-overview*') ? 'active' : '' }}">
            <i class="bi bi-calendar3"></i> Monthly Overview
        </a>
        <a href="{{ route('analytics') }}" class="nav-link {{ request()->routeIs('analytics*') ? 'active' : '' }}">
            <i class="bi bi-graph-up-arrow"></i> Analytics
        </a>

        <div class="sidebar-label">Config</div>
        <a href="{{ route('settings') }}" class="nav-link {{ request()->routeIs('settings*') ? 'active' : '' }}">
            <i class="bi bi-palette"></i> Appearance
        </a>
    </div>
</nav>

<!-- Main Wrapper -->
<div class="main-wrapper">

    <!-- Top Bar -->
    <header class="topbar">
        <div class="d-flex align-items-center gap-3">
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="bi bi-list"></i>
            </button>
            <h5 class="topbar-title">@yield('title', 'Dashboard')</h5>
        </div>
        <div class="topbar-right">
            @yield('topbar-actions')
            <span class="text-muted small d-none d-md-inline">{{ now()->format('F d, Y') }}</span>
        </div>
    </header>

    <!-- Flash Messages -->
    <div class="px-4 pt-3">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
                <i class="bi bi-check-circle-fill"></i>
                {{ session('success') }}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        @endif
        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ session('error') }}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        @endif
        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
                <ul class="mb-0 ps-3">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif
    </div>

    <!-- Content -->
    <main class="content-area">
        @yield('content')
    </main>

    <footer class="text-center py-3 text-muted small border-top bg-white">
        &copy; {{ now()->year }} Marketing Hub &mdash; All rights reserved.
    </footer>
</div>

<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<!-- Chart.js 4 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<script>
    // Sidebar toggle
    const toggle   = document.getElementById('sidebarToggle');
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebarOverlay');

    if (toggle) {
        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }
</script>

@yield('scripts')
</body>
</html>
