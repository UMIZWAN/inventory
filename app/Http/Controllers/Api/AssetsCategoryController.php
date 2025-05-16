<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\AssetsCategory;
use App\Models\Assets;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class AssetsCategoryController extends Controller
{
    public function index()
    {
        try {
            $assetsCategory = AssetsCategory::latest()->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Assets Category',
            'data' => Cache::remember('assets_category_cache', 3600, function () use ($assetsCategory) {
                return $assetsCategory;
            })
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:assets_category',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data Gagal Disimpan!',
                'data' => $validator->errors()
            ], 422);
        }

        $assetsCategory = AssetsCategory::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Assets Category Berhasil Ditambahkan!',
            'data' => $assetsCategory
        ], 201);
    }

    public function show($id)
    {
        $assetsCategory = AssetsCategory::find($id);

        if ($assetsCategory) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Category',
                'data' => $assetsCategory
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:assets_category,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $assetsCategory = AssetsCategory::find($id);

        if ($assetsCategory) {
            $assetsCategory->update([
                'name' => $request->name,
            ]);

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Diupdate!', $assetsCategory);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Category Berhasil Diupdate!',
                'data' => $assetsCategory
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $assetsCategory = AssetsCategory::find($id);

        if ($assetsCategory) {

            // Set asset_category_id to null for all assets that have this category
            Assets::where('asset_category_id', $id)->update(['asset_category_id' => null]);

            $assetsCategory->delete();

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Dihapus!', null);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Category Berhasil Dihapus!'
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}
