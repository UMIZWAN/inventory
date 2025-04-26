<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsTransactionResource;
use App\Models\AssetsTransaction;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetsTransactionController extends Controller
{
    public function index()
    {
        try {
            $assetsTransaction = AssetsTransaction::with('transactionItems')->paginate(20);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Purchase Order',
            'data' => $assetsTransaction
        ], 200);
    }

    public function show($id)
    {
        try {
            $assetsTransaction = AssetsTransaction::with('transactionItems')->find($id);
            if (!$assetsTransaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assets Transaction not found',
                    'data' => null
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Purchase Order',
            'data' => $assetsTransaction
        ], 200);
    }
}
