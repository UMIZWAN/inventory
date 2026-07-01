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
use App\Http\Controllers\Api\UsersBranchController;
use App\Http\Controllers\Api\AssetsImportController;
use App\Http\Controllers\Api\SsoController;
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

// SSO token deposit — called by infonet-super, no user auth required
Route::post('/sso/store-token', [SsoController::class, 'storeToken']);

Route::post('/login', [AuthController::class, 'login']);

Route::get('/report', [AssetsTransactionController::class, 'getReport']);




Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users-branch', [UsersBranchController::class, 'index']);
    // User API
    Route::get('/users-list', [AuthController::class, 'getAllUsers']);
    Route::post('/users', [AuthController::class, 'addUser']);
    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::patch('/users/{id}/deactivate', [AuthController::class, 'deleteUser']); // ✅ Deactivate (soft delete via is_active)
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
    Route::get('assets/get-list-branch', [AssetsController::class, 'getListByBranch']);
    Route::get('assets/get-itemlist', [AssetsController::class, 'getAssetList']);
    Route::post('/assets/import', [AssetsImportController::class, 'importFromCSV']);
    Route::post('/assets/{id}/copy', [AssetsController::class, 'copyItems']);
    Route::get('assets/get-by-branch', [AssetsController::class, 'getByBranch']);
    Route::apiResource('assets', AssetsController::class);

    Route::apiResource('shipping', ShippingOptionController::class);
    Route::apiResource('purpose', AssetsTransactionPurposeController::class);

    Route::apiResource('assets-transaction', AssetsTransactionController::class);
    Route::apiResource('purchase-order', PurchaseOrderController::class);
    Route::get('access-levels/{id}/users', [AccessLevelController::class, 'getWithUsers']);
    Route::post('/assets/{id}/upload', [AssetsController::class, 'update']);

    Route::get('report/item', [AssetsTransactionController::class, 'getSingleReport']);

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

    // Fix transfer stock — restricted to kamal@gmail.com
    Route::post('/fix-transfer-stock', function () {
        if (auth()->user()?->email !== 'kamal@gmail.com') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        try {
            $transactions = \App\Models\AssetsTransaction::where('assets_transaction_type', 'ASSET TRANSFER')
                ->whereIn('assets_transaction_status', ['RECEIVED', 'IN-TRANSIT'])
                ->with('transactionItems')
                ->get();

            $fixed = 0;
            $skipped = 0;
            $log = [];

            foreach ($transactions as $txn) {
                foreach ($txn->transactionItems as $item) {
                    if ($item->status === 'REJECTED') { $skipped++; continue; }

                    $bv = \App\Models\AssetsBranchValues::where('asset_branch_id', $txn->assets_from_branch_id)
                        ->where('asset_id', $item->asset_id)
                        ->first();

                    if (!$bv) { $skipped++; $log[] = "SKIP TXN#{$txn->id} Asset#{$item->asset_id} — no source branch value"; continue; }

                    $entries = $bv->branch_value_log ?? [];
                    $alreadyFixed = collect($entries)->contains(fn($e) => str_contains($e['message'] ?? '', 'FIX: ASSET TRANSFER'));
                    $alreadyLogged = collect($entries)->contains(fn($e) => str_contains($e['message'] ?? '', '→'));

                    if ($alreadyFixed || $alreadyLogged) { $skipped++; $log[] = "OK   TXN#{$txn->id} ({$txn->assets_transaction_running_number}) Asset#{$item->asset_id} — already handled"; continue; }

                    if ($bv->asset_current_unit < $item->asset_unit) {
                        $skipped++;
                        $log[] = "SKIP TXN#{$txn->id} ({$txn->assets_transaction_running_number}) Asset#{$item->asset_id} — stock already 0 or deducted elsewhere (current: {$bv->asset_current_unit}, needed: {$item->asset_unit})";
                        continue;
                    }

                    \DB::beginTransaction();
                    try {
                        $bv->decrement('asset_current_unit', $item->asset_unit);
                        $entries[] = ['message' => "FIX: ASSET TRANSFER deduction for {$txn->assets_transaction_running_number} ({$item->asset_unit})", 'user_id' => null, 'timestamp' => now()->toDateTimeString()];
                        $bv->update(['branch_value_log' => $entries]);
                        \DB::commit();
                        $fixed++;
                        $log[] = "FIX  TXN#{$txn->id} ({$txn->assets_transaction_running_number}) Asset#{$item->asset_id} — deducted {$item->asset_unit}";
                    } catch (\Exception $e) {
                        \DB::rollBack();
                        $log[] = "ERR  TXN#{$txn->id} Asset#{$item->asset_id} — {$e->getMessage()}";
                    }
                }
            }

            return response()->json(['message' => "Done. Fixed: {$fixed}, Skipped: {$skipped}", 'output' => implode("\n", $log)]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Run pending migrations — restricted to kamal@gmail.com
    Route::post('/run-migrations', function () {
        if (auth()->user()?->email !== 'kamal@gmail.com') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        try {
            $exitCode = \Artisan::call('migrate', ['--force' => true]);
            $output   = \Artisan::output();
            if ($exitCode !== 0) {
                return response()->json(['error' => 'Migration failed', 'output' => $output], 500);
            }
            return response()->json(['message' => 'Migrations ran successfully', 'output' => $output]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});




// Route::apiResource('assets', AssetsController::class);

// Route::apiResource('assets-transaction', AssetsTransactionController::class);

// Access Level Routes
Route::middleware('auth:sanctum')->group(function () {});
