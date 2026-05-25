<form method="GET" action="" class="d-flex align-items-center gap-2 flex-wrap">
    <select name="month" class="form-select form-select-sm" style="width:auto;" onchange="this.form.submit()">
        <option value="">All Months</option>
        @foreach(range(1,12) as $m)
            <option value="{{ $m }}" {{ (request('month') == $m) ? 'selected' : '' }}>
                {{ date('F', mktime(0,0,0,$m,1)) }}
            </option>
        @endforeach
    </select>
    <select name="year" class="form-select form-select-sm" style="width:auto;" onchange="this.form.submit()">
        <option value="">All Years</option>
        @foreach(range(now()->year, now()->year - 5) as $y)
            <option value="{{ $y }}" {{ (request('year') == $y) ? 'selected' : '' }}>{{ $y }}</option>
        @endforeach
    </select>
    @if(request('month') || request('year'))
        <a href="{{ url()->current() }}" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-x-circle"></i> Clear
        </a>
    @endif
</form>
