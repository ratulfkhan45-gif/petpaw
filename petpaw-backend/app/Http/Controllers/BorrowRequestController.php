<?php

namespace App\Http\Controllers;

use App\Models\BorrowListing;
use App\Models\BorrowRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BorrowRequestController extends Controller
{
    /** A user asks to borrow a pet for some days. The total is the listing's daily price x days, computed here. */
    public function store(Request $request, BorrowListing $listing): JsonResponse
    {
        abort_unless($listing->status === 'Active', 404);

        $data = $request->validate([
            'start' => ['required', 'date', 'after_or_equal:today'],
            'end' => ['required', 'date', 'after:start'],
            'care_plan' => ['required', 'string', 'min:10', 'max:1000'],
            'message' => ['nullable', 'string', 'max:500'],
        ], ['care_plan.min' => 'Tell the pet borrower how you’ll care for the pet']);

        $start = Carbon::parse($data['start'])->toDateString();
        $end = Carbon::parse($data['end'])->toDateString();
        $days = Carbon::parse($start)->diffInDays(Carbon::parse($end));

        if ($days < $listing->min_days || $days > $listing->max_days) {
            throw ValidationException::withMessages(['end' => ["This pet can be borrowed for {$listing->min_days}–{$listing->max_days} days"]]);
        }
        if ($start < $listing->available_from->toDateString() || $end > $listing->available_to->toDateString()) {
            throw ValidationException::withMessages(['end' => ['Available only between '.$listing->available_from->toDateString().' and '.$listing->available_to->toDateString()]]);
        }
        if (! $listing->isFree($start, $end)) {
            throw ValidationException::withMessages(['end' => ['These dates overlap a confirmed booking. Choose other dates.']]);
        }

        $duplicate = BorrowRequest::where('listing_id', $listing->id)
            ->where('borrower_id', $request->user()->id)
            ->where('status', 'pending')
            ->where('start_date', '<', $end)->where('end_date', '>', $start)
            ->exists();
        if ($duplicate) {
            throw ValidationException::withMessages(['start' => ['You already have a pending request for these dates.']]);
        }

        $req = BorrowRequest::create([
            'listing_id' => $listing->id,
            'borrower_id' => $request->user()->id,
            'owner_id' => $listing->owner_id,
            'start_date' => $start,
            'end_date' => $end,
            'days' => $days,
            'daily_price' => $listing->daily_price,
            'total' => $listing->daily_price * $days,
            'care_plan' => $data['care_plan'],
            'message' => $data['message'] ?? null,
        ]);

        return response()->json(['request' => $req->fresh(['listing', 'owner', 'borrower'])->toArrayFor('borrower')], 201);
    }

    /** The signed-in user's own requests. */
    public function mine(Request $request): JsonResponse
    {
        $rows = BorrowRequest::with(['listing', 'owner', 'borrower'])->where('borrower_id', $request->user()->id)->latest()->get();

        return response()->json(['requests' => $rows->map->toArrayFor('borrower')]);
    }

    /** Requests sent to the signed-in pet borrower: this is what their portal shows. */
    public function incoming(Request $request): JsonResponse
    {
        $q = BorrowRequest::with(['listing', 'owner', 'borrower'])->where('owner_id', $request->user()->id)->latest();
        if ($s = $request->query('status')) $q->where('status', $s);

        return response()->json(['requests' => $q->get()->map->toArrayFor('owner')]);
    }

    /** Pet borrower approves or declines a pending request. */
    public function decide(Request $request, string $code): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,declined'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $req = $this->find($code);
        abort_unless($req->owner_id === $request->user()->id, 403, 'This request was not sent to you.');

        DB::transaction(function () use ($req, $data) {
            $listing = BorrowListing::lockForUpdate()->find($req->listing_id);
            abort_unless($req->fresh()->status === 'pending', 422, 'This request has already been answered.');
            if ($data['status'] === 'approved' && ! $listing->isFree($req->start_date->toDateString(), $req->end_date->toDateString(), $req->id)) {
                abort(422, 'These dates now overlap another approved booking.');
            }
            $req->update([
                'status' => $data['status'],
                'decline_reason' => $data['status'] === 'declined' ? ($data['reason'] ?? null) : null,
                'decided_at' => now(),
            ]);
        });

        return response()->json(['request' => $req->fresh(['listing', 'owner', 'borrower'])->toArrayFor('owner')]);
    }

    /** The user withdraws a pending or approved request. */
    public function cancel(Request $request, string $code): JsonResponse
    {
        $req = $this->find($code);
        abort_unless($req->borrower_id === $request->user()->id, 403, 'This is not your request.');
        abort_unless(in_array($req->status, ['pending', 'approved'], true), 422, 'This request can no longer be cancelled.');

        $req->update(['status' => 'cancelled', 'decided_at' => now()]);

        return response()->json(['request' => $req->fresh(['listing', 'owner', 'borrower'])->toArrayFor('borrower')]);
    }

    private function find(string $code): BorrowRequest
    {
        $id = BorrowRequest::idFromCode($code);
        abort_unless($id, 404);

        return BorrowRequest::with(['listing', 'owner', 'borrower'])->findOrFail($id);
    }
}
