@extends('layouts.app')

@section('title', 'Email Campaigns')

@section('topbar-actions')
    <a href="{{ route('emails.export', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-download me-1"></i>Export CSV
    </a>
    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#importModal">
        <i class="bi bi-upload me-1"></i>Import CSV
    </button>
    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
        <i class="bi bi-plus-lg me-1"></i>Add Campaign
    </button>
@endsection

@section('content')
<!-- Stats Row -->
<div class="row g-3 mb-3">
    <div class="col-6 col-md-3">
        <div class="stat-card text-center">
            <div class="stat-value">{{ $total }}</div>
            <div class="stat-label">Campaigns</div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="stat-card text-center">
            <div class="stat-value">{{ number_format($totalSent) }}</div>
            <div class="stat-label">Total Sent</div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="stat-card text-center">
            <div class="stat-value text-success">{{ $avgOpen ? number_format($avgOpen, 1) . '%' : '—' }}</div>
            <div class="stat-label">Avg Open Rate</div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="stat-card text-center">
            <div class="stat-value text-primary">{{ $avgClick ? number_format($avgClick, 1) . '%' : '—' }}</div>
            <div class="stat-label">Avg Click Rate</div>
        </div>
    </div>
</div>

<div class="card mb-3">
    <div class="card-body py-2">
        <x-month-year-filter />
    </div>
</div>

<div class="card">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Campaign Name</th>
                        <th>Recipients</th>
                        <th>Open Rate</th>
                        <th>Click Rate</th>
                        <th>Notes</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($campaigns as $c)
                    <tr>
                        <td class="text-muted small text-nowrap">{{ $c->send_date ?: '—' }}</td>
                        <td class="fw-medium">{{ Str::limit($c->campaign_name, 55) }}</td>
                        <td>{{ number_format($c->recipients) }}</td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <div class="progress flex-grow-1" style="height:6px;width:60px;">
                                    <div class="progress-bar bg-success" style="width:{{ min($c->open_rate,100) }}%"></div>
                                </div>
                                <span class="text-muted small">{{ $c->open_rate }}%</span>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <div class="progress flex-grow-1" style="height:6px;width:60px;">
                                    <div class="progress-bar" style="width:{{ min($c->click_rate,100) }}%; background:var(--color-primary);"></div>
                                </div>
                                <span class="text-muted small">{{ $c->click_rate }}%</span>
                            </div>
                        </td>
                        <td><span class="text-muted small">{{ Str::limit($c->notes, 40) ?: '—' }}</span></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                data-id="{{ $c->id }}"
                                data-campaign_name="{{ $c->campaign_name }}"
                                data-send_date="{{ $c->send_date }}"
                                data-month="{{ $c->month }}"
                                data-year="{{ $c->year }}"
                                data-recipients="{{ $c->recipients }}"
                                data-open_rate="{{ $c->open_rate }}"
                                data-click_rate="{{ $c->click_rate }}"
                                data-notes="{{ $c->notes }}"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete"
                                data-id="{{ $c->id }}" data-title="{{ $c->campaign_name }}"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-2 d-block mb-2"></i>No campaigns found.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($campaigns->hasPages())
    <div class="card-footer bg-white py-2">{{ $campaigns->links() }}</div>
    @endif
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Add Email Campaign</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form action="{{ route('emails.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Campaign Name <span class="text-danger">*</span></label>
                            <input type="text" name="campaign_name" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Send Date</label>
                            <input type="date" name="send_date" class="form-control">
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
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Recipients</label>
                            <input type="number" name="recipients" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Open Rate (%)</label>
                            <input type="number" name="open_rate" class="form-control" value="0" min="0" max="100" step="0.01">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Click Rate (%)</label>
                            <input type="number" name="click_rate" class="form-control" value="0" min="0" max="100" step="0.01">
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
            <div class="modal-header"><h5 class="modal-title">Edit Email Campaign</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form id="editForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Campaign Name <span class="text-danger">*</span></label>
                            <input type="text" name="campaign_name" id="edit_campaign_name" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Send Date</label>
                            <input type="date" name="send_date" id="edit_send_date" class="form-control">
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
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Recipients</label>
                            <input type="number" name="recipients" id="edit_recipients" class="form-control" min="0">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Open Rate (%)</label>
                            <input type="number" name="open_rate" id="edit_open_rate" class="form-control" step="0.01">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Click Rate (%)</label>
                            <input type="number" name="click_rate" id="edit_click_rate" class="form-control" step="0.01">
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
        <div class="modal-header"><h5 class="modal-title text-danger">Delete Campaign</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
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
        <form action="{{ route('emails.import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="modal-body">
                <p class="text-muted small">Columns: <code>id, campaign_name, send_date, month, year, recipients, open_rate, click_rate, notes</code></p>
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
        document.getElementById('editForm').action = '/emails/' + d.id;
        document.getElementById('edit_campaign_name').value = d.campaign_name;
        document.getElementById('edit_send_date').value = d.send_date;
        document.getElementById('edit_month').value = d.month;
        document.getElementById('edit_year').value = d.year;
        document.getElementById('edit_recipients').value = d.recipients;
        document.getElementById('edit_open_rate').value = d.open_rate;
        document.getElementById('edit_click_rate').value = d.click_rate;
        document.getElementById('edit_notes').value = d.notes;
    });
});
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('delete_title').textContent = this.dataset.title;
        document.getElementById('deleteForm').action = '/emails/' + this.dataset.id;
    });
});
</script>
@endsection
