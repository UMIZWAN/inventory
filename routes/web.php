<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('tests.index');
// });

Route::get('/', function () {
    return inertia('Login');
});


Route::get('/assets', function () {
    return inertia('Assets');
});


