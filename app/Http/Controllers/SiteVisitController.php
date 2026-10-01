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
        // firstOrCreate() is race-safe against the (session_token, visited_on)
        // unique constraint as of this Laravel version: its create path
        // (createOrFirst()) catches UniqueConstraintViolationException and
        // re-fetches, so two near-simultaneous requests for the same visitor
        // can't throw a raw 500 here - no extra guarding needed.
        SiteVisit::query()->firstOrCreate([
            'session_token' => $request->validated('session_token'),
            'visited_on' => now()->toDateString(),
        ]);

        return response()->json(['status' => 'ok']);
    }
}
