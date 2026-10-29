<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProviderApplication extends Model
{
    protected $fillable = [
        'user_id', 'type', 'business_name', 'contact_name', 'email', 'phone', 'area', 'address',
        'licence', 'details', 'status', 'notes', 'reviewed_by', 'reviewed_at', 'submitted_at',
    ];

    protected function casts(): array
    {
        return ['details' => 'array', 'reviewed_at' => 'datetime', 'submitted_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class, 'application_id');
    }

    /** Public id shown in the UI, e.g. APP-1007. */
    public function getCodeAttribute(): string
    {
        return 'APP-'.(1000 + $this->id);
    }

    public static function idFromCode(string $code): ?int
    {
        return preg_match('/^APP-(\d+)$/', $code, $m) ? max(0, (int) $m[1] - 1000) : null;
    }

    public function toApiArray(bool $withDocUrls = false): array
    {
        return [
            'id' => $this->code,
            'type' => $this->type,
            'name' => $this->business_name,
            'contact' => $this->contact_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'area' => $this->area,
            'address' => $this->address,
            'licence' => $this->licence,
            'details' => $this->details,
            'submitted' => $this->submitted_at?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes ?? '',
            'docs' => $this->documents->pluck('original_name')->all(),
            'documents' => $this->documents->map(fn ($d) => [
                'id' => $d->id,
                'label' => $d->label,
                'name' => $d->original_name,
            ])->all(),
        ];
    }
}
