<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['Pet Hospital', 'Pet Doctor', 'Pharmacy', 'Pet Shop']);
            $table->string('business_name');
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone', 32)->nullable();
            $table->string('area', 80);
            $table->string('address');
            $table->string('licence', 120);
            $table->json('details')->nullable(); // doctor qualification/fee, shop delivery options, ...
            $table->enum('status', ['Pending Verification', 'Approved', 'Rejected', 'Corrections Requested'])->default('Pending Verification')->index();
            $table->text('notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('provider_applications')->cascadeOnDelete();
            $table->string('label');
            $table->string('original_name');
            $table->string('path'); // private disk
            $table->timestamps();
        });

        Schema::create('admin_invites', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('email')->nullable(); // when set, only this email can use the invite
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('used_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_invites');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('provider_applications');
    }
};
