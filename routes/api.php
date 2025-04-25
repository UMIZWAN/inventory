<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccessLevelController;
use App\Http\Controllers\Api\AssetsBranchController;
use App\Http\Controllers\Api\AssetsCategoryController;
use App\Http\Controllers\Api\AssetsTagController;
use App\Http\Controllers\Api\AssetsController;
use App\Http\Controllers\Api\AssetsTransactionController;
use App\Http\Controllers\Api\AssetsTransactionItemListController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/users', [AuthController::class, 'addUser']);
    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // assets routes
    Route::apiResource('assets', AssetsController::class);
});

Route::apiResource('assets-branch', AssetsBranchController::class);

Route::apiResource('assets-category', AssetsCategoryController::class);

Route::apiResource('assets-tag', AssetsTagController::class);
// Route::apiResource('assets', AssetsController::class);

// Route::apiResource('assets-transaction', AssetsTransactionController::class);

// Access Level Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('access-levels', AccessLevelController::class);
    Route::get('access-levels/{id}/users', [AccessLevelController::class, 'getWithUsers']);
});
