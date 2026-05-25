@extends('layouts.app')

@section('title', 'Monthly Overview')

@section('content')
<form action="{{ route('monthly-overview.upsert') }}" method="POST">
    @csrf

    <!-- Month/Year Selector -->
    <div class="card mb-4">
        <div class="card-body">
            <div class="row align-items-end g-3">
                <div class="col-auto">
                    <label class="form-label fw-medium">Month</label>
                    <select name="month" class="form-select" id="mo_month">
                        @foreach(range(1,12) as $m)
                        <option value="{{ $m }}" {{ $m == $month ? 'selected' : '' }}>
                            {{ date('F', mktime(0,0,0,$m,1)) }}
                        </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-auto">
                    <label class="form-label fw-medium">Year</label>
                    <select name="year" class="form-select" id="mo_year">
                        @foreach(range(now()->year, now()->year - 5) as $y)
                        <option value="{{ $y }}" {{ $y == $year ? 'selected' : '' }}>{{ $y }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-auto">
                    <a id="loadMonthBtn" href="{{ route('monthly-overview', ['month'=>$month,'year'=>$year]) }}" class="btn btn-outline-primary">
                        <i class="bi bi-arrow-clockwise me-1"></i>Load Month
                    </a>
                </div>
                <div class="col-auto ms-auto">
                    <button type="submit" class="btn btn-primary px-4">
                        <i class="bi bi-save me-1"></i>Save Overview
                    </button>
                </div>
            </div>
        </div>
    </div>

    @php $ov = $overview; @endphp

    <!-- Site Performance -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-globe me-2 text-primary"></i>Site Performance</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Active Users</label>
                    <input type="number" name="active_users" class="form-control" value="{{ old('active_users', $ov->active_users ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">New Users</label>
                    <input type="number" name="new_users" class="form-control" value="{{ old('new_users', $ov->new_users ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Total Clicks</label>
                    <input type="number" name="total_clicks" class="form-control" value="{{ old('total_clicks', $ov->total_clicks ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Total Impressions</label>
                    <input type="number" name="total_impressions" class="form-control" value="{{ old('total_impressions', $ov->total_impressions ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Avg CTR (%)</label>
                    <input type="number" name="avg_ctr" class="form-control" value="{{ old('avg_ctr', $ov->avg_ctr ?? 0) }}" step="0.01" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Avg Position</label>
                    <input type="number" name="avg_position" class="form-control" value="{{ old('avg_position', $ov->avg_position ?? 0) }}" step="0.01" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- YouTube Performance -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-youtube me-2 text-danger"></i>YouTube Performance</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">Views</label>
                    <input type="number" name="yt_views" class="form-control" value="{{ old('yt_views', $ov->yt_views ?? 0) }}" min="0">
                </div>
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">Watch Time (hrs)</label>
                    <input type="number" name="yt_watch_time" class="form-control" value="{{ old('yt_watch_time', $ov->yt_watch_time ?? 0) }}" step="0.01" min="0">
                </div>
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">Subscribers</label>
                    <input type="number" name="yt_subscribers" class="form-control" value="{{ old('yt_subscribers', $ov->yt_subscribers ?? 0) }}" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- Community Growth -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-people me-2 text-warning"></i>Community Growth</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">Previous Total</label>
                    <input type="number" name="community_prev" class="form-control" value="{{ old('community_prev', $ov->community_prev ?? 0) }}" min="0">
                </div>
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">New Added</label>
                    <input type="number" name="community_new" class="form-control" value="{{ old('community_new', $ov->community_new ?? 0) }}" min="0">
                </div>
                <div class="col-md-4 col-6">
                    <label class="form-label fw-medium">Total Members</label>
                    <input type="number" name="community_total" class="form-control" value="{{ old('community_total', $ov->community_total ?? 0) }}" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- LinkedIn Performance -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-linkedin me-2" style="color:#0077b5;"></i>LinkedIn Performance</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Impressions</label>
                    <input type="number" name="li_impressions" class="form-control" value="{{ old('li_impressions', $ov->li_impressions ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Reactions</label>
                    <input type="number" name="li_reactions" class="form-control" value="{{ old('li_reactions', $ov->li_reactions ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Comments</label>
                    <input type="number" name="li_comments" class="form-control" value="{{ old('li_comments', $ov->li_comments ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Reposts</label>
                    <input type="number" name="li_reposts" class="form-control" value="{{ old('li_reposts', $ov->li_reposts ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Page Views</label>
                    <input type="number" name="li_page_views" class="form-control" value="{{ old('li_page_views', $ov->li_page_views ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Unique Visitors</label>
                    <input type="number" name="li_unique_visitors" class="form-control" value="{{ old('li_unique_visitors', $ov->li_unique_visitors ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Button Clicks</label>
                    <input type="number" name="li_button_clicks" class="form-control" value="{{ old('li_button_clicks', $ov->li_button_clicks ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Followers</label>
                    <input type="number" name="li_followers" class="form-control" value="{{ old('li_followers', $ov->li_followers ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Search Appearances</label>
                    <input type="number" name="li_search_appearance" class="form-control" value="{{ old('li_search_appearance', $ov->li_search_appearance ?? 0) }}" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- Facebook Performance -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-facebook me-2 text-primary"></i>Facebook Performance</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Visits</label>
                    <input type="number" name="fb_visits" class="form-control" value="{{ old('fb_visits', $ov->fb_visits ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Views</label>
                    <input type="number" name="fb_views" class="form-control" value="{{ old('fb_views', $ov->fb_views ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Reach</label>
                    <input type="number" name="fb_reach" class="form-control" value="{{ old('fb_reach', $ov->fb_reach ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Interactions</label>
                    <input type="number" name="fb_interactions" class="form-control" value="{{ old('fb_interactions', $ov->fb_interactions ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Link Clicks</label>
                    <input type="number" name="fb_link_clicks" class="form-control" value="{{ old('fb_link_clicks', $ov->fb_link_clicks ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Follows</label>
                    <input type="number" name="fb_follows" class="form-control" value="{{ old('fb_follows', $ov->fb_follows ?? 0) }}" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- Twitter/X Performance -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-twitter-x me-2"></i>Twitter/X Performance</h6>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Impressions</label>
                    <input type="number" name="tw_impressions" class="form-control" value="{{ old('tw_impressions', $ov->tw_impressions ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Engagement Rate (%)</label>
                    <input type="number" name="tw_engagement_rate" class="form-control" value="{{ old('tw_engagement_rate', $ov->tw_engagement_rate ?? 0) }}" step="0.01" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Engagements</label>
                    <input type="number" name="tw_engagements" class="form-control" value="{{ old('tw_engagements', $ov->tw_engagements ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Profile Visits</label>
                    <input type="number" name="tw_profile_visits" class="form-control" value="{{ old('tw_profile_visits', $ov->tw_profile_visits ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Replies</label>
                    <input type="number" name="tw_replies" class="form-control" value="{{ old('tw_replies', $ov->tw_replies ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Likes</label>
                    <input type="number" name="tw_likes" class="form-control" value="{{ old('tw_likes', $ov->tw_likes ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Reposts</label>
                    <input type="number" name="tw_reposts" class="form-control" value="{{ old('tw_reposts', $ov->tw_reposts ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Bookmarks</label>
                    <input type="number" name="tw_bookmarks" class="form-control" value="{{ old('tw_bookmarks', $ov->tw_bookmarks ?? 0) }}" min="0">
                </div>
                <div class="col-md-3 col-6">
                    <label class="form-label fw-medium">Shares</label>
                    <input type="number" name="tw_shares" class="form-control" value="{{ old('tw_shares', $ov->tw_shares ?? 0) }}" min="0">
                </div>
            </div>
        </div>
    </div>

    <!-- Notes -->
    <div class="card mb-4">
        <div class="card-header">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-journal-text me-2 text-muted"></i>Notes</h6>
        </div>
        <div class="card-body">
            <textarea name="notes" class="form-control" rows="4" placeholder="Monthly notes, highlights, observations...">{{ old('notes', $ov->notes ?? '') }}</textarea>
        </div>
    </div>

    <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary btn-lg px-5">
            <i class="bi bi-save me-2"></i>Save Monthly Overview
        </button>
    </div>
</form>
@endsection

@section('scripts')
<script>
// Update load button URL when month/year selects change
function updateLoadBtn() {
    const m = document.getElementById('mo_month').value;
    const y = document.getElementById('mo_year').value;
    document.getElementById('loadMonthBtn').href = '/monthly-overview?month=' + m + '&year=' + y;
}
document.getElementById('mo_month').addEventListener('change', updateLoadBtn);
document.getElementById('mo_year').addEventListener('change', updateLoadBtn);
</script>
@endsection
