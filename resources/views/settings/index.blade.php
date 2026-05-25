@extends('layouts.app')

@section('title', 'Appearance Settings')

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0 fw-semibold"><i class="bi bi-palette me-2 text-primary"></i>Appearance Settings</h6>
            </div>
            <div class="card-body">
                <form id="settingsForm">
                    @csrf
                    <div class="row g-4">
                        <!-- Primary Color -->
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Primary Color</label>
                            <div class="d-flex align-items-center gap-3">
                                <input type="color" id="primary_color" name="primary_color"
                                    class="form-control form-control-color"
                                    value="{{ $settings['primary_color'] ?? '#3B82F6' }}"
                                    style="width:50px; height:40px; padding:2px;">
                                <input type="text" id="primary_color_text" class="form-control"
                                    value="{{ $settings['primary_color'] ?? '#3B82F6' }}"
                                    style="max-width:120px; font-family: monospace;">
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">Used for buttons, links, and active states.</small>
                            </div>
                        </div>

                        <!-- Accent Color -->
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Accent Color</label>
                            <div class="d-flex align-items-center gap-3">
                                <input type="color" id="accent_color" name="accent_color"
                                    class="form-control form-control-color"
                                    value="{{ $settings['accent_color'] ?? '#8B5CF6' }}"
                                    style="width:50px; height:40px; padding:2px;">
                                <input type="text" id="accent_color_text" class="form-control"
                                    value="{{ $settings['accent_color'] ?? '#8B5CF6' }}"
                                    style="max-width:120px; font-family: monospace;">
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">Used for highlights and secondary elements.</small>
                            </div>
                        </div>

                        <!-- Sidebar Background -->
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Sidebar Background</label>
                            <div class="d-flex align-items-center gap-3">
                                <input type="color" id="sidebar_bg" name="sidebar_bg"
                                    class="form-control form-control-color"
                                    value="{{ $settings['sidebar_bg'] ?? '#1e293b' }}"
                                    style="width:50px; height:40px; padding:2px;">
                                <input type="text" id="sidebar_bg_text" class="form-control"
                                    value="{{ $settings['sidebar_bg'] ?? '#1e293b' }}"
                                    style="max-width:120px; font-family: monospace;">
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">Background color for the navigation sidebar.</small>
                            </div>
                        </div>

                        <!-- Font Family -->
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Font Family</label>
                            <select id="font_family" name="font_family" class="form-select">
                                @php
                                    $fonts = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Lato', 'Nunito', 'Source Sans Pro'];
                                @endphp
                                @foreach($fonts as $font)
                                    <option value="{{ $font }}"
                                        style="font-family: '{{ $font }}';" 
                                        {{ ($settings['font_family'] ?? 'Inter') == $font ? 'selected' : '' }}>
                                        {{ $font }}
                                    </option>
                                @endforeach
                            </select>
                            <div class="mt-2">
                                <small class="text-muted">Applied to all text throughout the app.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Live Preview -->
                    <div class="mt-4 p-4 rounded-3 border" id="previewBox" style="background:#f8fafc;">
                        <h6 class="fw-semibold mb-3" id="previewTitle">Live Preview</h6>
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <button type="button" class="btn btn-sm preview-btn-primary" id="previewBtnPrimary">
                                Primary Button
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                Secondary Button
                            </button>
                            <span class="badge preview-badge-primary" id="previewBadge">Badge</span>
                        </div>
                        <div class="d-flex gap-3">
                            <div class="preview-sidebar-swatch rounded" id="previewSidebar" style="width:60px; height:60px;"></div>
                            <div>
                                <a href="#" class="preview-link" id="previewLink" style="text-decoration:none;">Sample link text</a><br>
                                <span id="previewFontSample" style="font-size:0.9rem; color:#475569;">
                                    The quick brown fox jumps over the lazy dog.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 d-flex gap-2 justify-content-end">
                        <button type="button" id="saveBtn" class="btn btn-primary px-5">
                            <i class="bi bi-save me-2"></i>Save Settings
                        </button>
                        <div id="saveStatus" class="align-self-center" style="display:none;"></div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Preset Colors -->
        <div class="card mt-4">
            <div class="card-header">
                <h6 class="mb-0 fw-semibold"><i class="bi bi-palette2 me-2"></i>Color Presets</h6>
            </div>
            <div class="card-body">
                <div class="d-flex flex-wrap gap-2">
                    @php
                        $presets = [
                            ['name' => 'Blue',   'primary' => '#3B82F6', 'accent' => '#8B5CF6', 'sidebar' => '#1e293b'],
                            ['name' => 'Indigo', 'primary' => '#6366F1', 'accent' => '#8B5CF6', 'sidebar' => '#1e1b4b'],
                            ['name' => 'Green',  'primary' => '#10B981', 'accent' => '#3B82F6', 'sidebar' => '#064e3b'],
                            ['name' => 'Orange', 'primary' => '#F97316', 'accent' => '#FBBF24', 'sidebar' => '#431407'],
                            ['name' => 'Rose',   'primary' => '#F43F5E', 'accent' => '#EC4899', 'sidebar' => '#4c0519'],
                            ['name' => 'Teal',   'primary' => '#14B8A6', 'accent' => '#06B6D4', 'sidebar' => '#042f2e'],
                            ['name' => 'Purple', 'primary' => '#A855F7', 'accent' => '#EC4899', 'sidebar' => '#2e1065'],
                            ['name' => 'Slate',  'primary' => '#475569', 'accent' => '#64748b', 'sidebar' => '#0f172a'],
                        ];
                    @endphp
                    @foreach($presets as $preset)
                    <button type="button" class="btn btn-sm border preset-btn d-flex align-items-center gap-2"
                        data-primary="{{ $preset['primary'] }}"
                        data-accent="{{ $preset['accent'] }}"
                        data-sidebar="{{ $preset['sidebar'] }}"
                        title="{{ $preset['name'] }}">
                        <span style="width:14px; height:14px; border-radius:50%; background:{{ $preset['primary'] }}; display:inline-block;"></span>
                        <span style="width:14px; height:14px; border-radius:50%; background:{{ $preset['sidebar'] }}; display:inline-block;"></span>
                        {{ $preset['name'] }}
                    </button>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function syncColors(colorId, textId) {
    const colorInput = document.getElementById(colorId);
    const textInput  = document.getElementById(textId);

    colorInput.addEventListener('input', function() {
        textInput.value = this.value;
        updatePreview();
    });

    textInput.addEventListener('input', function() {
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorInput.value = this.value;
            updatePreview();
        }
    });
}

syncColors('primary_color', 'primary_color_text');
syncColors('accent_color',  'accent_color_text');
syncColors('sidebar_bg',    'sidebar_bg_text');

document.getElementById('font_family').addEventListener('change', updatePreview);

function updatePreview() {
    const primary   = document.getElementById('primary_color').value;
    const accent    = document.getElementById('accent_color').value;
    const sidebarBg = document.getElementById('sidebar_bg').value;
    const font      = document.getElementById('font_family').value;

    // Update preview elements
    document.getElementById('previewBtnPrimary').style.background     = primary;
    document.getElementById('previewBtnPrimary').style.borderColor     = primary;
    document.getElementById('previewBtnPrimary').style.color           = '#fff';
    document.getElementById('previewBadge').style.background           = primary + '22';
    document.getElementById('previewBadge').style.color                = primary;
    document.getElementById('previewSidebar').style.background         = sidebarBg;
    document.getElementById('previewLink').style.color                 = primary;
    document.getElementById('previewFontSample').style.fontFamily      = `'${font}', system-ui, sans-serif`;
    document.getElementById('previewTitle').style.fontFamily           = `'${font}', system-ui, sans-serif`;
}

// Initialize preview
updatePreview();

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const d = this.dataset;
        document.getElementById('primary_color').value      = d.primary;
        document.getElementById('primary_color_text').value = d.primary;
        document.getElementById('accent_color').value       = d.accent;
        document.getElementById('accent_color_text').value  = d.accent;
        document.getElementById('sidebar_bg').value         = d.sidebar;
        document.getElementById('sidebar_bg_text').value    = d.sidebar;
        updatePreview();
    });
});

// AJAX save
document.getElementById('saveBtn').addEventListener('click', function() {
    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    const form = document.getElementById('settingsForm');
    const formData = new FormData(form);
    const data = {
        _token:         formData.get('_token'),
        primary_color:  document.getElementById('primary_color').value,
        accent_color:   document.getElementById('accent_color').value,
        sidebar_bg:     document.getElementById('sidebar_bg').value,
        font_family:    document.getElementById('font_family').value,
    };

    fetch('/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
            'Accept': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            // Apply CSS variables immediately
            const root = document.documentElement;
            root.style.setProperty('--color-primary', data.primary_color);
            root.style.setProperty('--color-accent',  data.accent_color);
            root.style.setProperty('--color-sidebar-bg', data.sidebar_bg);
            root.style.setProperty('--font-family', `'${data.font_family}', system-ui, sans-serif`);

            // Update sidebar
            document.querySelector('.sidebar').style.backgroundColor = data.sidebar_bg;

            const status = document.getElementById('saveStatus');
            status.style.display = 'block';
            status.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Settings saved!</span>';
            setTimeout(() => { status.style.display = 'none'; }, 3000);
        }
    })
    .catch(() => {
        alert('Failed to save settings.');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Save Settings';
    });
});
</script>
@endsection
