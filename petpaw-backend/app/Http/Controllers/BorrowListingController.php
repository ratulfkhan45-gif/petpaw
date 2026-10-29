<?php

namespace App\Http\Controllers;

use App\Models\BorrowListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BorrowListingController extends Controller
{
    /** Public browse. Filters: species, area, max_price, start, end (only pets free for those dates). */
    public function index(Request $request): JsonResponse
    {
        $q = BorrowListing::with('owner')->where('status', 'Active')->latest();
        if ($v = $request->query('species')) $q->where('species', $v);
        if ($v = $request->query('area')) $q->where('area', $v);
        if ($v = $request->query('max_price')) $q->where('daily_price', '<=', (int) $v);

        $start = $request->query('start');
        $end = $request->query('end');
        $listings = $q->get();
        if ($start && $end && $end > $start) {
            $listings = $listings->filter(fn (BorrowListing $l) => $start >= $l->available_from->toDateString()
                && $end <= $l->available_to->toDateString()
                && $l->isFree($start, $end))->values();
        }

        return response()->json(['listings' => $listings->map->toArrayFor(null)]);
    }

    public function show(BorrowListing $listing): JsonResponse
    {
        abort_unless($listing->status === 'Active', 404);
        $listing->load('owner');

        $booked = $listing->requests()->where('status', 'approved')->orderBy('start_date')->get(['start_date', 'end_date'])
            ->map(fn ($r) => ['start' => $r->start_date->toDateString(), 'end' => $r->end_date->toDateString()]);

        return response()->json(['listing' => $listing->toArrayFor(null), 'booked' => $booked]);
    }

    /** The signed-in pet borrower's own listings. */
    public function mine(Request $request): JsonResponse
    {
        $listings = BorrowListing::with('owner')->where('owner_id', $request->user()->id)->latest()->get();

        return response()->json(['listings' => $listings->map->toArrayFor($request->user())]);
    }

    public function store(Request $request): JsonResponse
    {
        $listing = BorrowListing::create($this->validated($request) + ['owner_id' => $request->user()->id]);

        return response()->json(['listing' => $listing->fresh('owner')->toArrayFor($request->user())], 201);
    }

    public function update(Request $request, BorrowListing $listing): JsonResponse
    {
        abort_unless($listing->owner_id === $request->user()->id, 403, 'This is not your listing.');
        $listing->update($this->validated($request, partial: true));

        return response()->json(['listing' => $listing->load('owner')->toArrayFor($request->user())]);
    }

    public function destroy(Request $request, BorrowListing $listing): JsonResponse
    {
        abort_unless($listing->owner_id === $request->user()->id, 403, 'This is not your listing.');
        if ($listing->requests()->where('status', 'approved')->where('end_date', '>=', today())->exists()) {
            abort(422, 'This pet has upcoming approved bookings. Pause the listing instead.');
        }
        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        $data = $request->validate([
            'name' => [$req, 'string', 'max:80'],
            'species' => [$req, 'in:Dog,Cat,Bird,Rabbit,Other'],
            'breed' => ['nullable', 'string', 'max:80'],
            'age' => ['nullable', 'string', 'max:40'],
            'img' => ['nullable', 'url', 'max:500'],
            'area' => [$req, 'string', 'max:80'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'exact_pickup' => [$req, 'string', 'min:8', 'max:255'],
            'return_place' => ['nullable', 'string', 'max:255'],
            'daily_price' => [$req, 'integer', 'min:1', 'max:100000'],
            'min_days' => [$req, 'integer', 'min:1', 'max:60'],
            'max_days' => [$req, 'integer', 'min:1', 'max:60', 'gte:min_days'],
            'available_from' => [$req, 'date'],
            'available_to' => [$req, 'date', 'after_or_equal:available_from'],
            'temperament' => ['nullable', 'string', 'max:1000'],
            'care' => ['nullable', 'string', 'max:1000'],
            'rules' => ['nullable', 'string', 'max:1000'],
            'supplies' => ['nullable', 'string', 'max:1000'],
            'activities' => ['nullable', 'string', 'max:1000'],
            'safety' => ['nullable', 'string', 'max:1000'],
            'emergency' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:Active,Paused'],
        ]);
        if (array_key_exists('return_place', $data) && $data['return_place'] === null) {
            unset($data['return_place']);
        }

        return $data;
    }
}
