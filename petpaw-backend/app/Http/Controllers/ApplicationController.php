<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** A provider's own verification application. */
class ApplicationController extends Controller
{
    public function mine(Request $request): JsonResponse
    {
        $app = $request->user()->application()->with('documents')->first();

        return response()->json(['application' => $app?->toApiArray()]);
    }

    public function resubmit(Request $request): JsonResponse
    {
        $app = $request->user()->application()->first();
        abort_if(! $app, 404, 'No application found for this account.');
        abort_if($app->status !== 'Corrections Requested', 422, 'This application is not waiting for corrections.');

        $request->validate([
            'label' => ['nullable', 'string', 'max:120'],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $file = $request->file('document');
        $app->documents()->create([
            'label' => $request->input('label', 'Corrected document'),
            'original_name' => $file->getClientOriginalName(),
            'path' => $file->store("applications/{$app->id}", 'local'),
        ]);
        $app->update(['status' => 'Pending Verification', 'notes' => null]);

        return response()->json(['application' => $app->load('documents')->toApiArray()]);
    }
}
