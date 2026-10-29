<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowRequest extends Model
{
    protected $fillable = [
        'listing_id', 'borrower_id', 'owner_id', 'start_date', 'end_date', 'days', 'daily_price', 'total',
        'care_plan', 'message', 'status', 'decline_reason', 'decided_at',
    ];

    protected function casts(): array
    {
        return ['start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d', 'decided_at' => 'datetime'];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(BorrowListing::class, 'listing_id');
    }

    /** The user who asked to borrow. */
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    /** The pet borrower who listed the pet. */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function getCodeAttribute(): string
    {
        return 'BR-'.(7000 + $this->id);
    }

    public static function idFromCode(string $code): ?int
    {
        return preg_match('/^BR-(\d+)$/', $code, $m) ? max(0, (int) $m[1] - 7000) : null;
    }

    /** $for is the viewer's side: 'owner' sees the requester's contact, 'borrower' sees the pickup once approved. */
    public function toArrayFor(string $for): array
    {
        $listing = $this->listing;
        $data = [
            'id' => $this->code,
            'listingId' => $this->listing_id,
            'pet' => $listing?->name,
            'species' => $listing?->species,
            'img' => $listing?->img,
            'owner' => $this->owner?->name,
            'borrower' => $this->borrower?->name,
            'start' => $this->start_date->toDateString(),
            'end' => $this->end_date->toDateString(),
            'days' => $this->days,
            'daily' => $this->daily_price,
            'total' => $this->total,
            'carePlan' => $this->care_plan,
            'message' => $this->message,
            'status' => $this->status,
            'declineReason' => $this->decline_reason,
            'created' => $this->created_at->toDateString(),
        ];
        if ($for === 'owner') {
            $data['borrowerPhone'] = $this->borrower?->phone;
            $data['borrowerEmail'] = $this->borrower?->email;
        }
        if ($for === 'borrower' && $this->status === 'approved') {
            $data['exactPickup'] = $listing?->exact_pickup;
            $data['ownerPhone'] = $this->owner?->phone;
        }

        return $data;
    }
}
