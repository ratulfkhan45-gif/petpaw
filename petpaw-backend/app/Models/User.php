<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const LABELS = [
        'user' => 'Pet owner',
        'admin' => 'Admin',
        'hospital' => 'Pet Hospital',
        'doctor' => 'Pet Doctor',
        'pharmacy' => 'Pharmacy',
        'shop' => 'Pet Shop',
        'borrow' => 'Pet Borrower',
    ];

    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'status'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function application(): HasOne
    {
        return $this->hasOne(ProviderApplication::class)->latestOfMany();
    }

    public function isProvider(): bool
    {
        return in_array($this->role, ['hospital', 'doctor', 'pharmacy', 'shop'], true);
    }

    /** Shape the React app expects for `db.auth`. */
    public function toAuthArray(): array
    {
        $data = [
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'label' => self::LABELS[$this->role] ?? $this->role,
            'name' => $this->name,
        ];

        if ($this->isProvider()) {
            $app = $this->application;
            $data['appId'] = $app ? $app->code : null;
            $data['pending'] = ! $app || $app->status !== 'Approved';
        }

        return $data;
    }
}
