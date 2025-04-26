<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        try {
            $purchaseOrder = PurchaseOrder::with('purchaseItem')->paginate(20);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Purchase Order',
            'data' => $purchaseOrder
        ], 200);
    }

    public function show($id)
    {
        try {
            $purchaseOrder = PurchaseOrder::with('purchaseItem')->find($id);
            if (!$purchaseOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase Order not found',
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
            'data' => $purchaseOrder
        ], 200);
    }
}
    // public function store(Request $request)
    // {
    //     try {
    //         $validator = Validator::make($request->all(), [
