<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrackSiteVisitRequest;
use App\Models\SiteVisit;
use Illuminate\Http\JsonResponse;

class SiteVisitController extends Controller
{
    /**
     * Records a storefront page load as a visit, deduplicated per visitor
     * session per calendar day - a repeat page load by the same visitor
     * later the same day doesn't inflate the count.
     */
    public function store(TrackSiteVisitRequest $request): JsonResponse
    {
        SiteVisit::query()->firstOrCreate([
            'session_token' => $request->validated('session_token'),
            'visited_on' => now()->toDateString(),
        ]);

        return response()->json(['status' => 'ok']);
    }
}
