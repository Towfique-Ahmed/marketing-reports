@extends('layouts.app')

@section('title', 'Blog Posts')

@section('topbar-actions')
    <a href="{{ route('blogs.export', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-download me-1"></i>Export CSV
    </a>
    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#importModal">
        <i class="bi bi-upload me-1"></i>Import CSV
    </button>
    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
        <i class="bi bi-plus-lg me-1"></i>Add Blog
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
                    <div class="text-muted" style="font-size:0.72rem;">TOTAL</div>
                </div>
                <div>
                    <div class="fw-bold text-success">{{ number_format($totalViews) }}</div>
                    <div class="text-muted" style="font-size:0.72rem;">VIEWS</div>
                </div>
                <div>
                    <div class="fw-bold text-warning">{{ $avgRank ? number_format($avgRank, 1) : '—' }}</div>
                    <div class="text-muted" style="font-size:0.72rem;">AVG RANK</div>
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
                        <th>Keywords</th>
                        <th>Views</th>
                        <th>Rank</th>
                        <th>AI Overview</th>
                        <th>Notes</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($posts as $post)
                    <tr>
                        <td class="text-nowrap text-muted small">{{ $post->publish_date ?: '—' }}</td>
                        <td>
                            @if($post->url)
                                <a href="{{ $post->url }}" target="_blank" class="text-decoration-none fw-medium">
                                    {{ Str::limit($post->title, 60) }} <i class="bi bi-box-arrow-up-right text-muted" style="font-size:.7rem;"></i>
                                </a>
                            @else
                                <span class="fw-medium">{{ Str::limit($post->title, 60) }}</span>
                            @endif
                        </td>
                        <td><span class="text-muted small">{{ Str::limit($post->keywords, 40) ?: '—' }}</span></td>
                        <td>{{ number_format($post->views) }}</td>
                        <td>
                            @if($post->rank)
                                <span class="badge {{ $post->rank <= 3 ? 'bg-success' : ($post->rank <= 10 ? 'bg-warning text-dark' : 'bg-secondary') }}">
                                    #{{ $post->rank }}
                                </span>
                            @else —
                            @endif
                        </td>
                        <td>
                            @if($post->ai_overview)
                                <span class="badge bg-info text-dark"><i class="bi bi-robot me-1"></i>Yes</span>
                            @else
                                <span class="text-muted small">—</span>
                            @endif
                        </td>
                        <td><span class="text-muted small">{{ Str::limit($post->notes, 40) ?: '—' }}</span></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                data-id="{{ $post->id }}"
                                data-title="{{ $post->title }}"
                                data-url="{{ $post->url }}"
                                data-publish_date="{{ $post->publish_date }}"
                                data-month="{{ $post->month }}"
                                data-year="{{ $post->year }}"
                                data-views="{{ $post->views }}"
                                data-rank="{{ $post->rank }}"
                                data-ai_overview="{{ $post->ai_overview }}"
                                data-keywords="{{ $post->keywords }}"
                                data-notes="{{ $post->notes }}"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete"
                                data-id="{{ $post->id }}"
                                data-title="{{ $post->title }}"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                            No blog posts found.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($posts->hasPages())
    <div class="card-footer bg-white py-2">{{ $posts->links() }}</div>
    @endif
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Add Blog Post</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form action="{{ route('blogs.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12"><label class="form-label fw-medium">Title <span class="text-danger">*</span></label><input type="text" name="title" class="form-control" required></div>
                        <div class="col-md-8"><label class="form-label fw-medium">URL</label><input type="url" name="url" class="form-control" placeholder="https://..."></div>
                        <div class="col-md-4"><label class="form-label fw-medium">Publish Date</label><input type="date" name="publish_date" class="form-control"></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Month</label><select name="month" class="form-select"><option value="">—</option>@foreach(range(1,12) as $m)<option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>@endforeach</select></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Year</label><select name="year" class="form-select"><option value="">—</option>@foreach(range(now()->year, now()->year - 5) as $y)<option value="{{ $y }}" {{ $y == now()->year ? 'selected' : '' }}>{{ $y }}</option>@endforeach</select></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Views</label><input type="number" name="views" class="form-control" value="0" min="0"></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Rank</label><input type="number" name="rank" class="form-control" value="0" min="0"></div>
                        <div class="col-md-6"><label class="form-label fw-medium">Keywords</label><input type="text" name="keywords" class="form-control"></div>
                        <div class="col-md-6"><label class="form-label fw-medium">AI Overview</label><input type="text" name="ai_overview" class="form-control"></div>
                        <div class="col-12"><label class="form-label fw-medium">Notes</label><textarea name="notes" class="form-control" rows="2"></textarea></div>
                    </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Edit Blog Post</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form id="editForm" method="POST">@csrf @method('PUT')
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12"><label class="form-label fw-medium">Title <span class="text-danger">*</span></label><input type="text" name="title" id="edit_title" class="form-control" required></div>
                        <div class="col-md-8"><label class="form-label fw-medium">URL</label><input type="url" name="url" id="edit_url" class="form-control"></div>
                        <div class="col-md-4"><label class="form-label fw-medium">Publish Date</label><input type="date" name="publish_date" id="edit_publish_date" class="form-control"></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Month</label><select name="month" id="edit_month" class="form-select"><option value="">—</option>@foreach(range(1,12) as $m)<option value="{{ $m }}">{{ date('F', mktime(0,0,0,$m,1)) }}</option>@endforeach</select></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Year</label><select name="year" id="edit_year" class="form-select"><option value="">—</option>@foreach(range(now()->year, now()->year - 5) as $y)<option value="{{ $y }}">{{ $y }}</option>@endforeach</select></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Views</label><input type="number" name="views" id="edit_views" class="form-control" min="0"></div>
                        <div class="col-md-3"><label class="form-label fw-medium">Rank</label><input type="number" name="rank" id="edit_rank" class="form-control" min="0"></div>
                        <div class="col-md-6"><label class="form-label fw-medium">Keywords</label><input type="text" name="keywords" id="edit_keywords" class="form-control"></div>
                        <div class="col-md-6"><label class="form-label fw-medium">AI Overview</label><input type="text" name="ai_overview" id="edit_ai_overview" class="form-control"></div>
                        <div class="col-12"><label class="form-label fw-medium">Notes</label><textarea name="notes" id="edit_notes" class="form-control" rows="2"></textarea></div>
                    </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title text-danger">Delete Blog Post</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">Are you sure you want to delete <strong id="delete_title"></strong>?</div>
        <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><form id="deleteForm" method="POST">@csrf @method('DELETE')<button type="submit" class="btn btn-danger">Delete</button></form></div>
    </div></div>
</div>

<!-- Import Modal -->
<div class="modal fade" id="importModal" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Import CSV</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <form action="{{ route('blogs.import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="modal-body">
                <p class="text-muted small">Columns: <code>id, title, url, publish_date, month, year, views, rank, ai_overview, keywords, notes</code></p>
                <input type="file" name="csv_file" class="form-control" accept=".csv,.txt" required>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Import</button></div>
        </form>
    </div></div>
</div>
@endsection

@section('scripts')
<script>
document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
        const d = this.dataset;
        document.getElementById('editForm').action = '/blogs/' + d.id;
        document.getElementById('edit_title').value = d.title;
        document.getElementById('edit_url').value = d.url;
        document.getElementById('edit_publish_date').value = d.publish_date;
        document.getElementById('edit_month').value = d.month;
        document.getElementById('edit_year').value = d.year;
        document.getElementById('edit_views').value = d.views;
        document.getElementById('edit_rank').value = d.rank;
        document.getElementById('edit_ai_overview').value = d.ai_overview;
        document.getElementById('edit_keywords').value = d.keywords;
        document.getElementById('edit_notes').value = d.notes;
    });
});
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('delete_title').textContent = this.dataset.title;
        document.getElementById('deleteForm').action = '/blogs/' + this.dataset.id;
    });
});
</script>
@endsection
