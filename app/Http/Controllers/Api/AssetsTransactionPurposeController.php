<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AssetsTransactionPurpose;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Models\AssetsTransaction;

class AssetsTransactionPurposeController extends Controller
{
    public function index()
    {
        try {
            $assetsTransactionPurpose = AssetsTransactionPurpose::latest()->get();
        } catch (Exception $e) {
            return response()->json([

                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Assets Transaction Purpose',
            'data' => Cache::remember('assets_transaction_purpose_cache', 3600, function () use ($assetsTransactionPurpose) {
                return $assetsTransactionPurpose;
            })

        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_transaction_purpose_name' => 'required|unique:assets_transaction_purpose',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data Gagal Disimpan!',
                'data' => $validator->errors()
            ], 422);
        }

        $assetsTransactionPurpose = AssetsTransactionPurpose::create([
            'asset_transaction_purpose_name' => $request->asset_transaction_purpose_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Assets Transaction Purpose Berhasil Ditambahkan!',
            'data' => $assetsTransactionPurpose
        ], 201);
    }

    public function show($id)
    {
        $assetsTransactionPurpose = AssetsTransactionPurpose::find($id);

        if ($assetsTransactionPurpose) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Transaction Purpose',
                'data' => $assetsTransactionPurpose
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

        $assetsTransactionPurpose = AssetsTransactionPurpose::find($id);

        if ($assetsTransactionPurpose) {
            $assetsTransactionPurpose->update([
                'asset_transaction_purpose_name' => $request->asset_transaction_purpose_name,
            ]);

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Diupdate!', $assetsCategory);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Transaction Purpose Berhasil Diupdate!',
                'data' => $assetsTransactionPurpose
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $assetsTransactionPurpose = AssetsTransactionPurpose::find($id);

        if ($assetsTransactionPurpose) {

            // Set asset_category_id to null for all assets that have this category
            AssetsTransaction::where('asset_transaction_purpose_id', $id)->update(['asset_transaction_purpose_id' => null]);

            $assetsTransactionPurpose->delete();

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Dihapus!', null);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Transaction Purpose Berhasil Dihapus!'
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}
