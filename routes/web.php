<?php

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Login');
});

// SSO landing page — validates one-time token, creates Sanctum token, hands it to localStorage
Route::get('/sso-login', function (\Illuminate\Http\Request $request) {
    $rawToken = $request->query('token', '');

    if ($rawToken === '') {
        return view('sso-login', ['token' => null, 'redirect' => '/', 'error' => 'No token provided.']);
    }

    $ssoToken = DB::table('sso_tokens')
        ->where('token', $rawToken)
        ->where('used', false)
        ->first();

    if (!$ssoToken || (int) $ssoToken->expires_at < time()) {
        return view('sso-login', ['token' => null, 'redirect' => '/', 'error' => 'SSO token is invalid or has expired.']);
    }

    // Mark as used immediately
    DB::table('sso_tokens')->where('id', $ssoToken->id)->update(['used' => true]);

    $user = User::where('username', $ssoToken->username)->where('is_active', true)->first();

    if (!$user) {
        return view('sso-login', ['token' => null, 'redirect' => '/', 'error' => 'User not found in this system.']);
    }

    // Create a Sanctum token — same as normal login
    $accessToken = $user->createToken('sso_login')->plainTextToken;

    return view('sso-login', [
        'token'    => $accessToken,
        'redirect' => '/items/item-list',
        'error'    => null,
    ]);
});

Route::get('/users', function () {
    return Inertia::render('Users/UserPage');
})->name('users');

Route::get('/import', function () {
    return inertia('ImportAssets');
});

Route::get('/profile', function () {
    return Inertia::render('Users/Profile');
});

Route::get('/access-levels', function () {
    return Inertia::render('AccessLevels/AccessLevelsPage');
})->name('access-levels');

Route::get('/categories', function () {
    return inertia('CategoryPage');
});

Route::get('/branch', function () {
    return inertia('BranchPage');
});

Route::get('/tags', function () {
    return inertia('TagPage');
});

Route::get('/supplier', function () {
    return inertia('SuppliersPage');
});

Route::get('/shipping', function () {
    return inertia('ShippingPage');
});

Route::get('/purpose', function () {
    return inertia('PurposePage');
});

Route::get('/inv-list', function () {
    return inertia('Report/CheckoutList');
});

Route::get('/inventory', function () {
    return inertia('Report/InventoryReport');
});

Route::get('/report/item/{id}/{branch}', function ($id, $branch) {
    return inertia('Report/SingleItemReport', [
        'id' => (int) $id,
        'branch_id' => (int) $branch,
    ]);
})->name('report.item');

Route::prefix('items')->group(function () {
    Route::get('/master-list', fn() => Inertia::render('Items/MasterListPage'));
    Route::get('/item-list', fn() => Inertia::render('Items/Assets'));
    Route::get('/item/{id}', fn($id) => Inertia::render('Items/ItemDetail', ['id' => (int) $id]));
    Route::get('/asset-transaction', fn() => Inertia::render('Items/StockTransfer'));
    Route::get('/asset-transfer', fn() => Inertia::render('Items/TransferForm'));
});

Route::prefix('purchase')->group(function () {
    Route::get('/order-stock', fn() => Inertia::render('Purchase/OrderStock'));
    // Route::get('/receive-stock', fn() => Inertia::render('Purchase/ReceiveForm'));
    Route::get('/view-orders', fn() => Inertia::render('Purchase/PurchaseOrder'));
    // Route::get('/view-receive-history', fn() => Inertia::render('Purchase/ReceiveHistory'));
    // Route::get('/view-items-on-order', fn () => Inertia::render('Purchase/ViewItemsOnOrder'));
    // Route::get('/order-low-stock-items', fn () => Inertia::render('Purchase/OrderLowStockItems'));
    // Route::get('/return-stock', fn () => Inertia::render('Purchase/ReturnStock'));
});

// Route::prefix('sell')->group(function () {
//     Route::get('/item-checkout', fn() => Inertia::render('Sell/StockOutPage'));
//     Route::get('/view-checkout-history', fn() => Inertia::render('Sell/CheckoutHistory'));
// });
