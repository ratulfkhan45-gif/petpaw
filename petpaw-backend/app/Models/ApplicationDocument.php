<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    protected $fillable = ['application_id', 'label', 'original_name', 'path'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(ProviderApplication::class, 'application_id');
    }
}
