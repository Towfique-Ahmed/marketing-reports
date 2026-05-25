@extends('layouts.app')

@section('title', 'Videos')

@section('topbar-actions')
    <a href="{{ route('videos.export', ['month'=>$month,'year'=>$year]) }}" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-download me-1"></i>Export CSV
    </a>
    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#importModal">
        <i class="bi bi-upload me-1"></i>Import CSV
    </button>
    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
        <i class="bi bi-plus-lg me-1"></i>Add Video
    </button>
@endsection

@section('content')
<div class="row g-3 mb-3">
    <div class="col-6 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ $total }}</div>
            <div class="stat-label">Videos</div>
        </div>
    </div>
    <div class="col-6 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ number_format($totalViews) }}</div>
            <div class="stat-label">Total Views</div>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="stat-card text-center">
            <div class="stat-value">{{ number_format($totalWatch, 1) }}h</div>
            <div class="stat-label">Watch Time</div>
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
                        <th>Platform</th>
                        <th>Views</th>
                        <th>Watch Time</th>
                        <th>Likes</th>
                        <th>Comments</th>
                        <th>Notes</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($videos as $v)
                    <tr>
                        <td class="text-muted small text-nowrap">{{ $v->publish_date ?: '—' }}</td>
                        <td>
                            @if($v->video_url)
                                <a href="{{ $v->video_url }}" target="_blank" class="fw-medium text-decoration-none">
                                    {{ Str::limit($v->title, 45) }} <i class="bi bi-box-arrow-up-right text-muted" style="font-size:.7rem;"></i>
                                </a>
                            @else
                                <span class="fw-medium">{{ Str::limit($v->title, 45) }}</span>
                            @endif
                        </td>
                        <td>
                            <span class="badge {{ $v->platform == 'YouTube' ? 'bg-danger' : 'bg-secondary' }}">
                                {{ $v->platform }}
                            </span>
                        </td>
                        <td>{{ number_format($v->views) }}</td>
                        <td>{{ number_format($v->watch_time_hours, 1) }}h</td>
                        <td>{{ number_format($v->likes) }}</td>
                        <td>{{ number_format($v->comments) }}</td>
                        <td><span class="text-muted small">{{ Str::limit($v->notes, 30) ?: '—' }}</span></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                data-id="{{ $v->id }}"
                                data-title="{{ $v->title }}"
                                data-platform="{{ $v->platform }}"
                                data-video_url="{{ $v->video_url }}"
                                data-publish_date="{{ $v->publish_date }}"
                                data-month="{{ $v->month }}"
                                data-year="{{ $v->year }}"
                                data-views="{{ $v->views }}"
                                data-watch_time_hours="{{ $v->watch_time_hours }}"
                                data-likes="{{ $v->likes }}"
                                data-comments="{{ $v->comments }}"
                                data-shares="{{ $v->shares }}"
                                data-notes="{{ $v->notes }}"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete"
                                data-id="{{ $v->id }}" data-title="{{ $v->title }}"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-2 d-block mb-2"></i>No videos found.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($videos->hasPages())
    <div class="card-footer bg-white py-2">{{ $videos->links() }}</div>
    @endif
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Add Video</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form action="{{ route('videos.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Platform</label>
                            <select name="platform" class="form-select">
                                <option value="YouTube">YouTube</option>
                                <option value="Vimeo">Vimeo</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-medium">Video URL</label>
                            <input type="url" name="video_url" class="form-control" placeholder="https://youtube.com/...">
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
                            <label class="form-label fw-medium">Views</label>
                            <input type="number" name="views" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Watch Time (hrs)</label>
                            <input type="number" name="watch_time_hours" class="form-control" value="0" step="0.01" min="0">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Likes</label>
                            <input type="number" name="likes" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Comments</label>
                            <input type="number" name="comments" class="form-control" value="0" min="0">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Shares</label>
                            <input type="number" name="shares" class="form-control" value="0" min="0">
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
            <div class="modal-header"><h5 class="modal-title">Edit Video</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <form id="editForm" method="POST">
                @csrf @method('PUT')
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-medium">Title <span class="text-danger">*</span></label>
                            <input type="text" name="title" id="edit_title" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-medium">Platform</label>
                            <select name="platform" id="edit_platform" class="form-select">
                                <option value="YouTube">YouTube</option>
                                <option value="Vimeo">Vimeo</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-medium">Video URL</label>
                            <input type="url" name="video_url" id="edit_video_url" class="form-control">
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
                            <label class="form-label fw-medium">Views</label>
                            <input type="number" name="views" id="edit_views" class="form-control" min="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-medium">Watch Time (hrs)</label>
                            <input type="number" name="watch_time_hours" id="edit_watch_time_hours" class="form-control" step="0.01">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Likes</label>
                            <input type="number" name="likes" id="edit_likes" class="form-control">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Comments</label>
                            <input type="number" name="comments" id="edit_comments" class="form-control">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-medium">Shares</label>
                            <input type="number" name="shares" id="edit_shares" class="form-control">
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
        <div class="modal-header"><h5 class="modal-title text-danger">Delete Video</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
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
        <form action="{{ route('videos.import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="modal-body">
                <p class="text-muted small">Columns: <code>id, title, platform, video_url, publish_date, month, year, views, watch_time_hours, likes, comments, shares, notes</code></p>
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
        document.getElementById('editForm').action = '/videos/' + d.id;
        document.getElementById('edit_title').value = d.title;
        document.getElementById('edit_platform').value = d.platform;
        document.getElementById('edit_video_url').value = d.video_url;
        document.getElementById('edit_publish_date').value = d.publish_date;
        document.getElementById('edit_month').value = d.month;
        document.getElementById('edit_year').value = d.year;
        document.getElementById('edit_views').value = d.views;
        document.getElementById('edit_watch_time_hours').value = d.watch_time_hours;
        document.getElementById('edit_likes').value = d.likes;
        document.getElementById('edit_comments').value = d.comments;
        document.getElementById('edit_shares').value = d.shares;
        document.getElementById('edit_notes').value = d.notes;
    });
});
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('delete_title').textContent = this.dataset.title;
        document.getElementById('deleteForm').action = '/videos/' + this.dataset.id;
    });
});
</script>
@endsection
