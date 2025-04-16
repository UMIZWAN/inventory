<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AssetsTag;
use Illuminate\Support\Facades\Validator;
class AssetsTagController extends Controller
{
    public function index()
    {
        try {
            $assetsTag = AssetsTag::latest()->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Assets Tag',
            'data' => $assetsTag
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:assets_branch',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data Gagal Disimpan!',
                'data' => $validator->errors()
            ], 422);
        }

        $assetsTag = AssetsTag::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Assets Tag Berhasil Ditambahkan!',
            'data' => $assetsTag
        ], 201);
    }

    public function show($id)
    {
        $assetsTag = AssetsTag::find($id);

        if ($assetsTag) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Tag',
                'data' => $assetsTag
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:assets_branch,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $assetsTag = AssetsTag::find($id);

        if ($assetsTag) {
            $assetsTag->update([
                'name' => $request->name,
            ]);

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Diupdate!', $assetsCategory);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Tag Berhasil Diupdate!',
                'data' => $assetsTag
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $assetsTag = AssetsTag::find($id);

        if ($assetsTag) {
            $assetsTag->delete();

            // return new AssetsBranchResource(true, 'Data Assets Category Berhasil Dihapus!', null);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Tag Berhasil Dihapus!'
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}
