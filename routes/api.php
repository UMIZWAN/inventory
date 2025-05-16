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
use App\Http\Controllers\Api\AssetsTransactionPurposeController;
use App\Http\Controllers\Api\SuppliersController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ShippingOptionController;
use Illuminate\Support\Facades\Cache;

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
    // User API
    Route::get('/users-list', [AuthController::class, 'getAllUsers']);
    Route::post('/users', [AuthController::class, 'addUser']);
    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Access Level Routes
    Route::apiResource('access-levels', AccessLevelController::class);
    // Supplier Routes
    Route::apiResource('suppliers', SuppliersController::class);
    // Tax Routes
    Route::apiResource('tax', TaxController::class);
    // Branch
    Route::apiResource('assets-branch', AssetsBranchController::class);
    // Category Routes
    Route::apiResource('assets-category', AssetsCategoryController::class);
    // Tag Routes
    Route::apiResource('assets-tag', AssetsTagController::class);
    // Assets Routes
    Route::post('/assets/{id}/copy', [AssetsController::class, 'copyItems']);
    Route::get('assets/get-by-branch', [AssetsController::class, 'getByBranch']);
    Route::apiResource('assets', AssetsController::class);

    Route::apiResource('shipping', ShippingOptionController::class);
    Route::apiResource('purpose', AssetsTransactionPurposeController::class);

    Route::apiResource('assets-transaction', AssetsTransactionController::class);
    Route::apiResource('purchase-order', PurchaseOrderController::class);
    Route::get('access-levels/{id}/users', [AccessLevelController::class, 'getWithUsers']);
    Route::post('/assets/{id}/upload', [AssetsController::class, 'update']);

    Route::post('/clear-cache', function (Request $request) {
        try {
            Cache::forget('access_levels_cache');
            Cache::forget('assets_branch_cache');
            Cache::forget('users_cache');
            Cache::forget('assets_cache');
            Cache::forget('assets_category_cache');
            Cache::forget('assets_transaction_purpose_cache');
            Cache::forget('shipping_option_cache');
            Cache::forget('suppliers_cache');
            return response()->json(['message' => 'Cache cleared successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});




// Route::apiResource('assets', AssetsController::class);

// Route::apiResource('assets-transaction', AssetsTransactionController::class);

// Access Level Routes
Route::middleware('auth:sanctum')->group(function () {});
