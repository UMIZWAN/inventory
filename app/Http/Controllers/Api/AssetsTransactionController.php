<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\AssetsTransaction;
use App\Http\Controllers\Controller;


class AssetsTransactionController extends Controller
{
    public function index()
    {
        return AssetsTransaction::with('items')->get();
    }

    public function show(AssetsTransaction $assetTransaction)
    {
        return $assetTransaction->load('items');
    }

    public function store(Request $request)
    {
        return AssetsTransaction::create($request->all());
    }

    public function update(Request $request, AssetsTransaction $assetTransaction)
    {
        $assetTransaction->update($request->all());
        return $assetTransaction;
    }

    public function destroy(AssetsTransaction $assetTransaction)
    {
        $assetTransaction->delete();
        return response()->noContent();
    }
}
