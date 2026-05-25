@extends('layouts.app')

@section('title', 'Landing Pages')

@section('topbar-actions')
    <a href="{{ route('landing-pages.export', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-download me-1"></i>Export CSV
    </a>
    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#importModal">
        <i class="bi bi-upload me-1"></i>Import CSV
    </button>
    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
        <i class="bi bi-plus-lg me-1"></i>Add Page
    </button>
@endsection

@section('content')
<div class="row g-3 mb-3">
    <div class="col-6 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ $total }}</div>
            <div class="stat-label">Landing Pages</div>
        </div>
    </div>
    <div class="col-6 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ number_format($totalSess) }}</div>
            <div class="stat-label">Total Sessions</div>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ $avgConvRate ? number_format($avgConvRate, 1) . '%' : '—' }}</div>
            <div class="stat-label">Avg Conversion Rate</div>
        </div>
    </div>
</div>

<div class="card mb-3">
    <div class="card-body py-2"><x-month-year-filter /></div>
</div>

<div class="card">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>URL</th>
                        <th>Type</th>
                        <th>Sessions</th>
                        <th>Conversions</th>
                        <th>Conv. Rate</th>
                        <th>Bounce Rate</th>
                        <th>Notes</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($pages as $p)
                    <tr>
                        <td class="text-muted small text-nowrap">{{ $p->publish_date ?: '—' }}</td>
                        <td class="fw-medium">{{ Str::limit($p->title, 40) }}</td>
                        <td>
                            @if($p->page_url)
                                <a href="{{ $p->page_url }}" target="_blank" class="text-primary small">
                                    {{ Str::limit($p->page_url, 30) }} <i class="bi bi-box-arrow-up-right" style="font-size:.7rem;"></i>
                                </a>
                            @else <span class="text-muted small">—</span> @endif
                        </td>
                        <td>
                            <span class="badge {{ $p->page_type == 'new' ? 'bg-success' : 'bg-info text-dark' }}">
                                {{ ucfirst($p->page_type) }}
                            </span>
                        </td>
                        <td>{{ number_format($p->sessions) }}</td>
                        <td>{{ number_format($p->conversions) }}</td>
                        <td><span class="text-success fw-medium">{{ $p->conversion_rate }}%</span></td>
                        <td><span class="text-danger">{{ $p->bounce_rate }}%</span></td>
                        <td><span class="text-muted small">{{ Str::limit($p->notes, 30) ?: '—' }}</span></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                data-id="{{ $p->id }}"
                                data-title="{{ $p->title }}"
                                data-page_url="{{ $p->page_url }}"
                                data-page_type="{{ $p->page_type }}"
                                data-publish_date="{{ $p->publish_date }}"
                                data-month="{{ $p->month }}"
                                data-year="{{ $p->year }}"
                                data-sessions="{{ $p->sessions }}"
                                data-conversions="{{ $p->conversions }}"
                                data-conversion_rate="{{ $p->conversion_rate }}"
                                data-bounce_rate="{{ $p->bounce_rate }}"
                                data-notes="{{ $p->notes }}"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete"
                                data-id="{{ $p->id }}" data-title="{{ $p->title }}"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="10" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-2 d-block mb-2"></i>No landing pages found.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($pages->hasPages())
    <div class="card-footer bg-white py-2">{{ $pages->links() }}</div>
    @endif
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Add Landing Page</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form action="{{ route('landing-pages.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Type</label>
                            <select name="page_type" class="form-select">
                                <option value="new">New</option>
                                <option value="updated">Updated</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Page URL</label>
                            <input type="url" name="page_url" class="form-control" placeholder="https://...">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Publish Date</label>
                            <input type="date" name="publish_date" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Month</label>
                            <select name="month" class="form-select">
                                <option value="">—</option>
                                @foreach(range(1,12) as $m)<option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>@endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Year</label>
                            <select name="year" class="form-select">
                                <option value="">—</option>
                                @foreach(range(now()->year, now()->year - 5) as $y)
                                <option value="{{ $y }}" {{ $y == now()->year ? 'selected' : '' }}>{{ $y }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Sessions</label>
                            <input type="number" name="sessions" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Conversions</label>
                            <input type="number" name="conversions" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Conversion Rate (%)</label>
                            <input type="number" name="conversion_rate" class="form-control" value="0" step="0.01" min="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Bounce Rate (%)</label>
                            <input type="number" name="bounce_rate" class="form-control" value="0" step="0.01" min="0">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Notes</label>
                            <textarea name="notes" class="form-control" rows="2"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Edit Landing Page</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form id="editForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" id="edit_title" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Type</label>
                            <select name="page_type" id="edit_page_type" class="form-select">
                                <option value="new">New</option>
                                <option value="updated">Updated</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Page URL</label>
                            <input type="url" name="page_url" id="edit_page_url" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Publish Date</label>
                            <input type="date" name="publish_date" id="edit_publish_date" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Month</label>
                            <select name="month" id="edit_month" class="form-select">
                                <option value="">—</option>
                                @foreach(range(1,12) as $m)<option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>@endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Year</label>
                            <select name="year" id="edit_year" class="form-select">
                                <option value="">—</option>
                                @foreach(range(now()->year, now()->year - 5) as $y)<option value="{{ $y }}">{{ $y }}</option>@endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Sessions</label>
                            <input type="number" name="sessions" id="edit_sessions" class="form-control">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Conversions</label>
                            <input type="number" name="conversions" id="edit_conversions" class="form-control">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Conv. Rate (%)</label>
                            <input type="number" name="conversion_rate" id="edit_conversion_rate" class="form-control" step="0.01">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Bounce Rate (%)</label>
                            <input type="number" name="bounce_rate" id="edit_bounce_rate" class="form-control" step="0.01">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Notes</label>
                            <textarea name="notes" id="edit_notes" class="form-control" rows="2"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title text-danger">Delete Landing Page</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">Delete <strong id="delete_title"></strong>?</div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <form id="deleteForm" method="POST">@csrf @method('DELETE')<button type="submit" class="btn btn-danger">Delete</button></form>
        </div>
    </div></div>
</div>

<!-- Import Modal -->
<div class="modal fade" id="importModal" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Import CSV</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <form action="{{ route('landing-pages.import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="modal-body">
                <p class="text-muted small">Columns: <code>id, title, page_url, page_type, publish_date, month, year, sessions, conversions, conversion_rate, bounce_rate, notes</code></p>
                <input type="file" name="csv_file" class="form-control" accept=".csv,.txt" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Import</button>
            </div>
        </form>
    </div></div>
</div>
@endsection

@section('scripts')
<script>
document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
        const d = this.dataset;
        document.getElementById('editForm').action = '/landing-pages/' + d.id;
        document.getElementById('edit_title').value = d.title;
        document.getElementById('edit_page_url').value = d.page_url;
        document.getElementById('edit_page_type').value = d.page_type;
        document.getElementById('edit_publish_date').value = d.publish_date;
        document.getElementById('edit_month').value = d.month;
        document.getElementById('edit_year').value = d.year;
        document.getElementById('edit_sessions').value = d.sessions;
        document.getElementById('edit_conversions').value = d.conversions;
        document.getElementById('edit_conversion_rate').value = d.conversion_rate;
        document.getElementById('edit_bounce_rate').value = d.bounce_rate;
        document.getElementById('edit_notes').value = d.notes;
    });
});
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('delete_title').textContent = this.dataset.title;
        document.getElementById('deleteForm').action = '/landing-pages/' + this.dataset.id;
    });
});
</script>
@endsection
