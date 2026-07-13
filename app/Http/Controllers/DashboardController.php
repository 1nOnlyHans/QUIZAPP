<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DashboardOverviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardOverviewService $overview,
    ) {}

    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('dashboard', [
            'overview' => $this->overview->forUser($user),
        ]);
    }
}
