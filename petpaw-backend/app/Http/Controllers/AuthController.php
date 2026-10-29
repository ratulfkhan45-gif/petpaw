<?php

namespace App\Http\Controllers;

use App\Models\ProviderApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Required verification documents per provider role. The client sends them as documents[<label>]. */
    public const DOCS = [
        'hospital' => ['Trade licence', 'DLS clinic registration'],
        'doctor' => ['BVC registration card', 'DVM degree certificate'],
        'pharmacy' => ['DGDA drug licence', 'Trade licence'],
        'shop' => ['Trade licence'],
    ];

    private const TYPES = [
        'hospital' => 'Pet Hospital',
        'doctor' => 'Pet Doctor',
        'pharmacy' => 'Pharmacy',
        'shop' => 'Pet Shop',
    ];

    public function register(Request $request): JsonResponse
    {
        $role = $request->input('role', 'user');
        $isProvider = isset(self::DOCS[$role]);

        $rules = [
            'role' => ['required', Rule::in(['user', 'borrow', 'admin', ...array_keys(self::DOCS)])],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190', 'unique:users,email'],
            'phone' => ['required', 'regex:/^(\+?880)?0?1[3-9]\d{8}$/'],
            'password' => ['required', 'string', 'min:8', 'regex:/[A-Za-z]/', 'regex:/\d/'],
        ];
        $messages = [
            'email.unique' => 'An account with this email already exists. Try logging in.',
            'phone.regex' => 'Enter a Bangladeshi mobile number, e.g. 01712-345678',
            'password.regex' => 'Use at least 8 characters with letters and numbers',
        ];

        if ($isProvider) {
            $rules += [
                'business_name' => [$role === 'doctor' ? 'nullable' : 'required', 'string', 'min:3', 'max:150'],
                'licence' => ['required', 'string', 'max:120'],
                'area' => ['required', 'string', 'max:80'],
                'address' => ['required', 'string', 'min:8', 'max:255'],
                'documents' => ['required', 'array'],
                'documents.*' => ['file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'],
            ];
            if ($role === 'doctor') {
                $rules += [
                    'spec' => ['required', 'string', 'max:120'],
                    'fee' => ['required', 'numeric', 'min:1'],
                    'qual' => ['nullable', 'string', 'max:150'],
                    'exp' => ['nullable', 'integer', 'min:0', 'max:70'],
                    'hospital_ref' => ['nullable', 'string', 'max:40'],
                ];
            }
            if ($role === 'shop') {
                $rules += ['delivery' => ['nullable', 'boolean'], 'pickup' => ['nullable', 'boolean']];
            }
        }

        $data = $request->validate($rules, $messages);

        if ($role === 'admin' && User::where('role', 'admin')->exists()) {
            return response()->json(['message' => 'An admin account already exists. Admin registration is closed.'], 403);
        }
        $email = strtolower(trim($data['email']));

        if ($isProvider) {
            $missing = array_values(array_filter(self::DOCS[$role], fn ($label) => ! $request->hasFile("documents.$label")));
            if ($missing) {
                throw ValidationException::withMessages(['documents' => ['Upload: '.implode(', ', $missing)]]);
            }
        }

        $user = DB::transaction(function () use ($request, $data, $role, $email, $isProvider) {
            if ($role === 'admin' && User::where('role', 'admin')->lockForUpdate()->exists()) {
                abort(403, 'An admin account already exists. Admin registration is closed.');
            }

            $displayName = match (true) {
                $role === 'doctor' => Str::startsWith($data['name'], 'Dr') ? $data['name'] : 'Dr. '.$data['name'],
                $isProvider => $data['business_name'],
                default => $data['name'],
            };

            $user = User::create([
                'name' => $displayName,
                'email' => $email,
                'phone' => $data['phone'],
                'password' => $data['password'],
                'role' => $role,
            ]);

            if ($isProvider) {
                $app = ProviderApplication::create([
                    'user_id' => $user->id,
                    'type' => self::TYPES[$role],
                    'business_name' => $displayName,
                    'contact_name' => $data['name'],
                    'email' => $email,
                    'phone' => $data['phone'],
                    'area' => $data['area'],
                    'address' => $data['address'],
                    'licence' => $data['licence'],
                    'details' => $request->only(['qual', 'spec', 'exp', 'fee', 'hospital_ref', 'delivery', 'pickup']) ?: null,
                    'submitted_at' => now(),
                ]);
                foreach (self::DOCS[$role] as $label) {
                    $file = $request->file("documents.$label");
                    $app->documents()->create([
                        'label' => $label,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $file->store("applications/{$app->id}", 'local'),
                    ]);
                }
            }

            return $user;
        });

        return $this->session($user->fresh(), 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'The email or password is incorrect. Check for typos and try again.'], 422);
        }
        if ($user->status !== 'Active') {
            return response()->json(['message' => 'This account has been suspended. Contact PetPaw support.'], 403);
        }

        return $this->session($user);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->load('application')->toAuthArray()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function session(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'user' => $user->load('application')->toAuthArray(),
            'token' => $user->createToken('web')->plainTextToken,
        ], $status);
    }
}
