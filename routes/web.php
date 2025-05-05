<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Login');
});

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

Route::prefix('items')->group(function () {
    Route::get('/master-list', fn() => Inertia::render('Items/MasterListPage'));
    Route::get('/item-list', fn() => Inertia::render('Items/Assets'));
    Route::get('/asset-transaction', fn() => Inertia::render('Items/StockTransfer'));
});

// Route::prefix('purchase')->group(function () {
//     Route::get('/order-stock', fn() => Inertia::render('Purchase/OrderStock'));
//     Route::get('/receive-stock', fn() => Inertia::render('Purchase/ReceiveForm'));
//     // Route::get('/view-orders', fn () => Inertia::render('Purchase/ViewOrders'));
//     Route::get('/view-receive-history', fn() => Inertia::render('Purchase/ReceiveHistory'));
//     // Route::get('/view-items-on-order', fn () => Inertia::render('Purchase/ViewItemsOnOrder'));
//     // Route::get('/order-low-stock-items', fn () => Inertia::render('Purchase/OrderLowStockItems'));
//     // Route::get('/return-stock', fn () => Inertia::render('Purchase/ReturnStock'));
// });

// Route::prefix('sell')->group(function () {
//     Route::get('/item-checkout', fn() => Inertia::render('Sell/StockOutPage'));
//     Route::get('/view-checkout-history', fn() => Inertia::render('Sell/CheckoutHistory'));
// });

Route::get('/users', function () {
    return Inertia::render('Users/UserPage');
})->name('users');


Route::get('/access-levels', function () {
    return Inertia::render('AccessLevels/AccessLevelsPage');
})->name('access-levels');

