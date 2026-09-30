<?php

namespace App\Http\Controllers;

use App\Actions\Orders\TrackIncompleteOrderAction;
use App\Http\Requests\TrackIncompleteOrderRequest;
use Illuminate\Http\JsonResponse;

class IncompleteOrderController extends Controller
{
    public function store(TrackIncompleteOrderRequest $request, TrackIncompleteOrderAction $action): JsonResponse
    {
        $data = $request->validated();
        $sessionToken = $data['session_token'];
        unset($data['session_token']);

        $action->execute($sessionToken, $data, $request->ip(), $request->userAgent());

        return response()->json(['status' => 'ok']);
    }
}
