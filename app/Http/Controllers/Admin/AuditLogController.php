<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/audit-logs/index', [
            'logs' => AuditLog::query()
                ->with('user:id,name,email')
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        ]);
    }
}
