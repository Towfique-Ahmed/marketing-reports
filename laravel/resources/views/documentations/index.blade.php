@extends('layouts.app')

@section('title', 'Documentation')

@section('topbar-actions')
    <a href="{{ route('documentations.export', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-download me-1"></i>Export CSV
    </a>
    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#importModal">
        <i class="bi bi-upload me-1"></i>Import CSV
    </button>
    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
        <i class="bi bi-plus-lg me-1"></i>Add Doc
    </button>
@endsection

@section('content')
<div class="card mb-3">
    <div class="card-body py-2">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <x-month-year-filter />
            <div class="d-flex gap-3 text-center">
                <div>
                    <div class="fw-bold text-primary">{{ number_format($total) }}</div>
                    <div class="text-muted" style="font-size:0.72rem;">TOTAL DOCS</div>
                </div>
            </div>
        </div>
    </div>
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
                        <th>Month / Year</th>
                        <th>Notes</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($docs as $doc)
                    <tr>
                        <td class="text-nowrap text-muted small">{{ $doc->publish_date ?: '—' }}</td>
                        <td class="fw-medium">{{ Str::limit($doc->title, 60) }}</td>
                        <td>
                            @if($doc->url)
                                <a href="{{ $doc->url }}" target="_blank" class="text-primary small">
                                    {{ Str::limit($doc->url, 40) }} <i class="bi bi-box-arrow-up-right" style="font-size:.7rem;"></i>
                                </a>
                            @else
                                <span class="text-muted small">—</span>
                            @endif
                        </td>
                        <td class="text-muted small">
                            @if($doc->month && $doc->year)
                                {{ date('M', mktime(0,0,0,$doc->month,1)) }} {{ $doc->year }}
                            @else —
                            @endif
                        </td>
                        <td><span class="text-muted small">{{ Str::limit($doc->notes, 50) ?: '—' }}</span></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                data-id="{{ $doc->id }}"
                                data-title="{{ $doc->title }}"
                                data-url="{{ $doc->url }}"
                                data-publish_date="{{ $doc->publish_date }}"
                                data-month="{{ $doc->month }}"
                                data-year="{{ $doc->year }}"
                                data-notes="{{ $doc->notes }}"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete"
                                data-id="{{ $doc->id }}"
                                data-title="{{ $doc->title }}"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                            No documentation found. <a href="#" data-bs-toggle="modal" data-bs-target="#addModal">Add the first one.</a>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($docs->hasPages())
    <div class="card-footer bg-white py-2">{{ $docs->links() }}</div>
    @endif
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Documentation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('documentations.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">URL</label>
                            <input type="url" name="url" class="form-control" placeholder="https://...">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Publish Date</label>
                            <input type="date" name="publish_date" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Month</label>
                            <select name="month" class="form-select">
                                <option value="">—</option>
                                @foreach(range(1,12) as $m)
                                <option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>
                                @endforeach
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
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Documentation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="editForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" id="edit_title" class="form-control" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">URL</label>
                            <input type="url" name="url" id="edit_url" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Publish Date</label>
                            <input type="date" name="publish_date" id="edit_publish_date" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Month</label>
                            <select name="month" id="edit_month" class="form-select">
                                <option value="">—</option>
                                @foreach(range(1,12) as $m)
                                <option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Year</label>
                            <select name="year" id="edit_year" class="form-select">
                                <option value="">—</option>
                                @foreach(range(now()->year, now()->year - 5) as $y)
                                <option value="{{ $y }}">{{ $y }}</option>
                                @endforeach
                            </select>
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
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title text-danger">Delete Documentation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">Are you sure you want to delete <strong id="delete_title"></strong>?</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <form id="deleteForm" method="POST">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn btn-danger">Delete</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Import Modal -->
<div class="modal fade" id="importModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Import CSV</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('documentations.import') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <p class="text-muted small">Columns: <code>id, title, url, publish_date, month, year, notes</code></p>
                    <input type="file" name="csv_file" class="form-control" accept=".csv,.txt" required>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Import</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
        const d = this.dataset;
        document.getElementById('editForm').action = '/documentations/' + d.id;
        document.getElementById('edit_title').value = d.title;
        document.getElementById('edit_url').value = d.url;
        document.getElementById('edit_publish_date').value = d.publish_date;
        document.getElementById('edit_month').value = d.month;
        document.getElementById('edit_year').value = d.year;
        document.getElementById('edit_notes').value = d.notes;
    });
});
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('delete_title').textContent = this.dataset.title;
        document.getElementById('deleteForm').action = '/documentations/' + this.dataset.id;
    });
});
</script>
@endsection
