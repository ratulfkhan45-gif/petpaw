<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pet borrowers (people who lend their pet out) are a separate account type from pet-owner users.
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'admin', 'hospital', 'doctor', 'pharmacy', 'shop', 'borrow'])->default('user')->change();
        });

        Schema::create('borrow_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('species', 40);
            $table->string('breed', 80)->nullable();
            $table->string('age', 40)->nullable();
            $table->string('img', 500)->nullable();
            $table->string('area', 80)->index();
            $table->decimal('lat', 9, 6)->nullable();
            $table->decimal('lng', 9, 6)->nullable();
            $table->string('exact_pickup', 255);
            $table->string('return_place', 255)->default('Same as pickup');
            $table->unsignedInteger('daily_price'); // Taka per day, set by the pet borrower
            $table->unsignedSmallInteger('min_days')->default(1);
            $table->unsignedSmallInteger('max_days')->default(7);
            $table->date('available_from');
            $table->date('available_to');
            $table->text('temperament')->nullable();
            $table->text('care')->nullable();
            $table->text('rules')->nullable();
            $table->text('supplies')->nullable();
            $table->text('activities')->nullable();
            $table->text('safety')->nullable();
            $table->string('emergency', 255)->nullable();
            $table->enum('status', ['Active', 'Paused'])->default('Active')->index();
            $table->timestamps();
        });

        Schema::create('borrow_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('borrow_listings')->cascadeOnDelete();
            $table->foreignId('borrower_id')->constrained('users')->cascadeOnDelete(); // the user asking to borrow
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete(); // the pet borrower who lists the pet
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('days');
            $table->unsignedInteger('daily_price'); // snapshot of the listing price at request time
            $table->unsignedInteger('total');
            $table->text('care_plan');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'approved', 'declined', 'cancelled'])->default('pending')->index();
            $table->string('decline_reason', 255)->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['listing_id', 'status', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_requests');
        Schema::dropIfExists('borrow_listings');
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'admin', 'hospital', 'doctor', 'pharmacy', 'shop'])->default('user')->change();
        });
    }
};
