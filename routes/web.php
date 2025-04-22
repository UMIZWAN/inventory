<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Login');
});


Route::get('/assets', function () {
    return inertia('Assets');
});

Route::get('/categories', function () {
    return inertia('CategoryPage');
});

Route::get('/tags', function () {
    return inertia('TagPage');
});

Route::prefix('purchase')->group(function () {
    Route::get('/order-stock', fn () => Inertia::render('Purchase/OrderStock'));
    Route::get('/receive-stock', fn () => Inertia::render('Purchase/ReceiveForm'));
    // Route::get('/view-orders', fn () => Inertia::render('Purchase/ViewOrders'));
    // Route::get('/view-receive-history', fn () => Inertia::render('Purchase/ViewReceiveHistory'));
    // Route::get('/view-items-on-order', fn () => Inertia::render('Purchase/ViewItemsOnOrder'));
    // Route::get('/order-low-stock-items', fn () => Inertia::render('Purchase/OrderLowStockItems'));
    // Route::get('/return-stock', fn () => Inertia::render('Purchase/ReturnStock'));
});

Route::get('/test', function () {
    return inertia('TestPage');
});


