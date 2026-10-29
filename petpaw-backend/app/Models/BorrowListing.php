<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BorrowListing extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'species', 'breed', 'age', 'img', 'area', 'lat', 'lng', 'exact_pickup', 'return_place',
        'daily_price', 'min_days', 'max_days', 'available_from', 'available_to', 'temperament', 'care', 'rules',
        'supplies', 'activities', 'safety', 'emergency', 'status',
    ];

    protected function casts(): array
    {
        return ['available_from' => 'date:Y-m-d', 'available_to' => 'date:Y-m-d', 'lat' => 'float', 'lng' => 'float'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(BorrowRequest::class, 'listing_id');
    }

    public function getCodeAttribute(): string
    {
        return 'BL-'.(100 + $this->id);
    }

    /** True if no approved booking overlaps [start, end). */
    public function isFree(string $start, string $end, ?int $exceptRequestId = null): bool
    {
        return ! $this->requests()
            ->where('status', 'approved')
            ->when($exceptRequestId, fn ($q) => $q->where('id', '!=', $exceptRequestId))
            ->where('start_date', '<', $end)
            ->where('end_date', '>', $start)
            ->exists();
    }

    /** Public shape. The exact pickup address is only included for the owner. */
    public function toArrayFor(?User $viewer): array
    {
        $isOwner = $viewer && $viewer->id === $this->owner_id;
        $data = [
            'id' => $this->id,
            'code' => $this->code,
            'owner' => $this->owner?->name,
            'name' => $this->name,
            'species' => $this->species,
            'breed' => $this->breed,
            'age' => $this->age,
            'img' => $this->img,
            'area' => $this->area,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'returnPlace' => $this->return_place,
            'daily' => $this->daily_price,
            'minDays' => $this->min_days,
            'maxDays' => $this->max_days,
            'availableFrom' => $this->available_from->toDateString(),
            'availableTo' => $this->available_to->toDateString(),
            'temperament' => $this->temperament,
            'care' => $this->care,
            'rules' => $this->rules,
            'supplies' => $this->supplies,
            'activities' => $this->activities,
            'safety' => $this->safety,
            'emergency' => $this->emergency,
            'status' => $this->status,
            'mine' => $isOwner,
        ];
        if ($isOwner) {
            $data['exactPickup'] = $this->exact_pickup;
        }

        return $data;
    }
}
