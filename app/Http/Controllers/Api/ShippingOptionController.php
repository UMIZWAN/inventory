<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShippingOption;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Models\Assets;

class ShippingOptionController extends Controller
{
    public function index()
    {
        try {
            $shippingOption = ShippingOption::latest()->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Shipping Option',
            'data' => Cache::remember('shipping_option_cache', 3600, function () use ($shippingOption) {
                return $shippingOption;
            })
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shipping_option_name' => 'required|unique:shipping_option',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data Gagal Disimpan!',
                'data' => $validator->errors()
            ], 422);
        }

        $shippingOption = ShippingOption::create([
            'shipping_option_name' => $request->shipping_option_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Shipping Option Berhasil Ditambahkan!',
            'data' => $shippingOption
        ], 201);
    }

    public function show($id)
    {
        $shippingOption = ShippingOption::find($id);

        if ($shippingOption) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Transaction Purpose',
                'data' => $shippingOption
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'asset_transaction_purpose_name' => 'required|unique:assets_transaction_purpose,asset_transaction_purpose_name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $shippingOption = ShippingOption::find($id);

        if ($shippingOption) {
            $shippingOption->update([
                'shipping_option_name' => $request->shipping_option_name,
            ]);

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Diupdate!', $assetsCategory);
            return response()->json([
                'success' => true,
                'message' => 'Data Shipping Option Berhasil Diupdate!',
                'data' => $shippingOption
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $shippingOption = ShippingOption::find($id);

        if ($shippingOption) {
            $shippingOption->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data Shipping Option Berhasil Dihapus!'
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}
