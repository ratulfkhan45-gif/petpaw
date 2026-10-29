<?php

namespace Database\Seeders;

use App\Models\ProviderApplication;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Same demo logins the React prototype shows on its login page (password: demo1234).
        $demo = [
            ['user@petpaw.bd', 'user', 'Ayesha Rahman'],
            ['admin@petpaw.bd', 'admin', 'Rakib Hasan'],
            ['hospital@petpaw.bd', 'hospital', 'Dhanmondi Pet Care Hospital'],
            ['doctor@petpaw.bd', 'doctor', 'Dr. Farhana Rahman'],
            ['pharmacy@petpaw.bd', 'pharmacy', 'VetMed Pharmacy'],
            ['shop@petpaw.bd', 'shop', 'Whiskers & Wags'],
        ];
        $types = ['hospital' => 'Pet Hospital', 'doctor' => 'Pet Doctor', 'pharmacy' => 'Pharmacy', 'shop' => 'Pet Shop'];

        foreach ($demo as [$email, $role, $name]) {
            $user = User::updateOrCreate(['email' => $email], [
                'name' => $name, 'role' => $role, 'phone' => '01712345678', 'password' => 'demo1234',
            ]);
            if (isset($types[$role])) {
                ProviderApplication::firstOrCreate(['user_id' => $user->id], [
                    'type' => $types[$role], 'business_name' => $name, 'contact_name' => $name, 'email' => $email,
                    'phone' => '01712345678', 'area' => 'Dhanmondi', 'address' => 'Dhanmondi, Dhaka',
                    'licence' => 'DEMO-0001', 'status' => 'Approved', 'submitted_at' => now()->subMonths(3),
                ]);
            }
        }

        // Sample applications waiting for review (no uploaded files, demo data only).
        $pending = [
            ['Pet Hospital', 'Lalmatia Vet & Surgery', 'Dr. Mizanur Rahman', 'lalmatia.vet@mail.bd', 'Mohammadpur', 'Pending Verification', null, 'hospital'],
            ['Pet Doctor', 'Dr. Rifat Mahmud', 'Dr. Rifat Mahmud', 'rifat.vet@mail.bd', 'Badda', 'Pending Verification', null, 'doctor'],
            ['Pharmacy', 'CareVet Pharma Point', 'Hasib Uddin', 'carevet@mail.bd', 'Motijheel', 'Corrections Requested', 'Drug licence copy is expired. Please upload the renewed DGDA licence.', 'pharmacy'],
        ];
        foreach ($pending as [$type, $name, $contact, $email, $area, $status, $notes, $role]) {
            $user = User::firstOrCreate(['email' => $email], [
                'name' => $name, 'role' => $role, 'phone' => '01811223344', 'password' => 'demo1234',
            ]);
            ProviderApplication::firstOrCreate(['user_id' => $user->id], [
                'type' => $type, 'business_name' => $name, 'contact_name' => $contact, 'email' => $email,
                'phone' => '01811223344', 'area' => $area, 'address' => "$area, Dhaka", 'licence' => 'SAMPLE-001',
                'status' => $status, 'notes' => $notes, 'submitted_at' => now()->subDays(2),
            ]);
        }
    }
}
