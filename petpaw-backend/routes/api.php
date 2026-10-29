<?php

use App\Http\Controllers\Admin\ApplicationReviewController;
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BorrowListingController;
use App\Http\Controllers\BorrowRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'role'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Pet Borrow: anyone can browse; users request; pet borrowers list pets and answer requests.
Route::prefix('borrow')->group(function () {
    Route::get('listings', [BorrowListingController::class, 'index']);
    Route::get('listings/{listing}', [BorrowListingController::class, 'show'])->whereNumber('listing');

    Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
        Route::post('listings/{listing}/requests', [BorrowRequestController::class, 'store'])->whereNumber('listing')->middleware('throttle:20,1');
        Route::get('my-requests', [BorrowRequestController::class, 'mine']);
        Route::patch('my-requests/{code}/cancel', [BorrowRequestController::class, 'cancel']);
    });

    Route::middleware(['auth:sanctum', 'role:borrow'])->group(function () {
        Route::get('my-listings', [BorrowListingController::class, 'mine']);
        Route::post('my-listings', [BorrowListingController::class, 'store']);
        Route::patch('my-listings/{listing}', [BorrowListingController::class, 'update'])->whereNumber('listing');
        Route::delete('my-listings/{listing}', [BorrowListingController::class, 'destroy'])->whereNumber('listing');
        Route::get('incoming', [BorrowRequestController::class, 'incoming']);
        Route::patch('incoming/{code}', [BorrowRequestController::class, 'decide']);
    });
});

Route::middleware(['auth:sanctum', 'role:hospital,doctor,pharmacy,shop'])->prefix('application')->group(function () {
    Route::get('/', [ApplicationController::class, 'mine']);
    Route::post('resubmit', [ApplicationController::class, 'resubmit']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('applications', [ApplicationReviewController::class, 'index']);
    Route::get('applications/{code}', [ApplicationReviewController::class, 'show']);
    Route::patch('applications/{code}', [ApplicationReviewController::class, 'update']);
    Route::get('applications/{code}/documents/{document}', [ApplicationReviewController::class, 'document']);

    Route::get('users', [UserAdminController::class, 'index']);
    Route::patch('users/{user}/status', [UserAdminController::class, 'updateStatus']);
});
