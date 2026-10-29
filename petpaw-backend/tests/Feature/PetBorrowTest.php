<?php

namespace Tests\Feature;

use App\Models\BorrowListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PetBorrowTest extends TestCase
{
    use RefreshDatabase;

    private function account(string $role): User
    {
        return User::factory()->create(['role' => $role, 'phone' => '01712345678'])->fresh();
    }

    private function listing(User $owner, array $over = []): BorrowListing
    {
        return BorrowListing::create($over + [
            'owner_id' => $owner->id, 'name' => 'Bruno', 'species' => 'Dog', 'area' => 'Dhanmondi',
            'exact_pickup' => 'Road 4, House 22, Dhanmondi', 'daily_price' => 500, 'min_days' => 1, 'max_days' => 5,
            'available_from' => now()->toDateString(), 'available_to' => now()->addDays(60)->toDateString(),
        ]);
    }

    private function dates(int $from = 3, int $days = 2): array
    {
        return ['start' => now()->addDays($from)->toDateString(), 'end' => now()->addDays($from + $days)->toDateString()];
    }

    public function test_pet_borrower_can_register_and_list_a_pet_with_a_daily_price(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'role' => 'borrow', 'name' => 'Ayesha Rahman', 'email' => 'ayesha@mail.bd',
            'phone' => '01712345678', 'password' => 'secret123',
        ])->assertCreated()->assertJsonPath('user.role', 'borrow');

        $this->withToken($res->json('token'))->postJson('/api/borrow/my-listings', [
            'name' => 'Bruno', 'species' => 'Dog', 'area' => 'Dhanmondi', 'exact_pickup' => 'Road 4, House 22',
            'daily_price' => 500, 'min_days' => 1, 'max_days' => 5,
            'available_from' => now()->toDateString(), 'available_to' => now()->addDays(30)->toDateString(),
        ])->assertCreated()->assertJsonPath('listing.daily', 500)->assertJsonPath('listing.status', 'Active');
    }

    public function test_user_requests_for_days_and_total_is_daily_price_times_days(): void
    {
        $listing = $this->listing($this->account('borrow'));
        $user = $this->account('user');

        $this->actingAs($user)->postJson("/api/borrow/listings/{$listing->id}/requests", $this->dates(3, 3) + [
            'care_plan' => 'Two walks daily and strict food chart.',
        ])->assertCreated()
            ->assertJsonPath('request.days', 3)
            ->assertJsonPath('request.daily', 500)
            ->assertJsonPath('request.total', 1500)
            ->assertJsonPath('request.status', 'pending')
            ->assertJsonMissingPath('request.exactPickup');
    }

    public function test_request_reaches_the_pet_borrower_portal_and_other_borrowers_do_not_see_it(): void
    {
        $owner = $this->account('borrow');
        $other = $this->account('borrow');
        $listing = $this->listing($owner);
        $user = $this->account('user');

        $this->actingAs($user)->postJson("/api/borrow/listings/{$listing->id}/requests", $this->dates() + ['care_plan' => 'Walks and a fenced rooftop.'])->assertCreated();

        $this->actingAs($owner)->getJson('/api/borrow/incoming')
            ->assertOk()->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.borrower', $user->name)
            ->assertJsonPath('requests.0.borrowerPhone', '01712345678');

        $this->actingAs($other)->getJson('/api/borrow/incoming')->assertOk()->assertJsonCount(0, 'requests');
    }

    public function test_user_and_pet_borrower_roles_are_separate(): void
    {
        $owner = $this->account('borrow');
        $listing = $this->listing($owner);

        $this->actingAs($owner)->postJson("/api/borrow/listings/{$listing->id}/requests", $this->dates() + ['care_plan' => 'Walks and a fenced rooftop.'])->assertForbidden();
        $this->actingAs($this->account('user'))->postJson('/api/borrow/my-listings', [])->assertForbidden();
    }

    public function test_guests_cannot_see_incoming_requests(): void
    {
        $this->getJson('/api/borrow/incoming')->assertUnauthorized();
    }

    public function test_days_must_respect_the_listing_limits_and_availability(): void
    {
        $listing = $this->listing($this->account('borrow'));
        $user = $this->account('user');
        $url = "/api/borrow/listings/{$listing->id}/requests";
        $plan = ['care_plan' => 'Walks and a fenced rooftop.'];

        $this->actingAs($user)->postJson($url, $this->dates(3, 6) + $plan)->assertJsonValidationErrors('end');   // over max_days
        $this->actingAs($user)->postJson($url, $this->dates(70, 2) + $plan)->assertJsonValidationErrors('end'); // outside availability
        $this->actingAs($user)->postJson($url, ['start' => now()->addDays(4)->toDateString(), 'end' => now()->addDays(4)->toDateString()] + $plan)->assertJsonValidationErrors('end');
    }

    public function test_approve_then_dates_are_blocked_and_pickup_is_revealed_to_the_user(): void
    {
        $owner = $this->account('borrow');
        $listing = $this->listing($owner);
        $user = $this->account('user');
        $url = "/api/borrow/listings/{$listing->id}/requests";
        $body = $this->dates(3, 3) + ['care_plan' => 'Walks and a fenced rooftop.'];

        $code = $this->actingAs($user)->postJson($url, $body)->json('request.id');
        $second = $this->actingAs($this->account('user'))->postJson($url, $this->dates(4, 2) + ['care_plan' => 'Walks and a fenced rooftop.'])->json('request.id');

        $this->actingAs($owner)->patchJson("/api/borrow/incoming/$code", ['status' => 'approved'])
            ->assertOk()->assertJsonPath('request.status', 'approved');

        $this->actingAs($user)->getJson('/api/borrow/my-requests')
            ->assertJsonPath('requests.0.exactPickup', 'Road 4, House 22, Dhanmondi');

        // Overlapping dates can no longer be requested or approved.
        $this->actingAs($this->account('user'))->postJson($url, $this->dates(4, 2) + ['care_plan' => 'Walks and a fenced rooftop.'])->assertJsonValidationErrors('end');
        $this->actingAs($owner)->patchJson("/api/borrow/incoming/$second", ['status' => 'approved'])->assertStatus(422);
        $this->actingAs($owner)->patchJson("/api/borrow/incoming/$code", ['status' => 'declined'])->assertStatus(422);
    }

    public function test_only_the_receiving_pet_borrower_can_answer(): void
    {
        $listing = $this->listing($this->account('borrow'));
        $code = $this->actingAs($this->account('user'))->postJson("/api/borrow/listings/{$listing->id}/requests", $this->dates() + ['care_plan' => 'Walks and a fenced rooftop.'])->json('request.id');

        $this->actingAs($this->account('borrow'))->patchJson("/api/borrow/incoming/$code", ['status' => 'approved'])->assertForbidden();
    }

    public function test_public_listing_hides_exact_pickup_and_filters_by_dates_and_price(): void
    {
        $owner = $this->account('borrow');
        $a = $this->listing($owner);
        $this->listing($owner, ['name' => 'Coco', 'daily_price' => 900]);

        $res = $this->getJson('/api/borrow/listings')->assertOk()->assertJsonCount(2, 'listings');
        $this->assertArrayNotHasKey('exactPickup', $res->json('listings.0'));

        $this->getJson('/api/borrow/listings?max_price=600')->assertJsonCount(1, 'listings')->assertJsonPath('listings.0.name', 'Bruno');

        $d = $this->dates(3, 2);
        $code = $this->actingAs($this->account('user'))->postJson("/api/borrow/listings/{$a->id}/requests", $d + ['care_plan' => 'Walks and a fenced rooftop.'])->json('request.id');
        $this->actingAs($owner)->patchJson("/api/borrow/incoming/$code", ['status' => 'approved'])->assertOk();
        $this->getJson("/api/borrow/listings?start={$d['start']}&end={$d['end']}")->assertJsonCount(1, 'listings')->assertJsonPath('listings.0.name', 'Coco');
    }

    public function test_user_can_cancel_a_pending_request(): void
    {
        $listing = $this->listing($this->account('borrow'));
        $user = $this->account('user');
        $code = $this->actingAs($user)->postJson("/api/borrow/listings/{$listing->id}/requests", $this->dates() + ['care_plan' => 'Walks and a fenced rooftop.'])->json('request.id');

        $this->actingAs($user)->patchJson("/api/borrow/my-requests/$code/cancel")->assertOk()->assertJsonPath('request.status', 'cancelled');
    }
}
