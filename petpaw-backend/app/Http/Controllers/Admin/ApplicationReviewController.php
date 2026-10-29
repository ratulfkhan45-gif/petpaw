<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApplicationDocument;
use App\Models\ProviderApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = ProviderApplication::with('documents')->latest('submitted_at');
        if ($s = $request->query('status')) $q->where('status', $s);
        if ($t = $request->query('type')) $q->where('type', $t);
        if ($term = $request->query('q')) {
            $q->where(fn ($w) => $w->where('business_name', 'like', "%$term%")->orWhere('email', 'like', "%$term%"));
        }

        return response()->json(['applications' => $q->get()->map->toApiArray()]);
    }

    public function show(string $code): JsonResponse
    {
        return response()->json(['application' => $this->find($code)->toApiArray()]);
    }

    public function update(Request $request, string $code): JsonResponse
    {
        $app = $this->find($code);
        $data = $request->validate([
            'status' => ['required', 'in:Approved,Rejected,Corrections Requested'],
            'notes' => ['nullable', 'string', 'max:1000', 'required_unless:status,Approved'],
        ], ['notes.required_unless' => 'Add a note explaining the decision so the applicant knows what to do next.']);

        $app->update([
            'status' => $data['status'],
            'notes' => $data['status'] === 'Approved' ? null : $data['notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['application' => $app->fresh('documents')->toApiArray()]);
    }

    public function document(string $code, ApplicationDocument $document): StreamedResponse
    {
        $app = $this->find($code);
        abort_unless($document->application_id === $app->id, 404);

        return Storage::disk('local')->download($document->path, $document->original_name);
    }

    private function find(string $code): ProviderApplication
    {
        $id = ProviderApplication::idFromCode($code);
        abort_if(! $id, 404);

        return ProviderApplication::with('documents')->findOrFail($id);
    }
}
