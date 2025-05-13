<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsBranchResource;
use App\Models\AssetsBranch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;


class AssetsBranchController extends Controller
{
    public function index()
    {
        try {
            $branch_id = Auth::user()->branch_id;
            $assetsBranch = AssetsBranch::select('id', 'name')
            ->where('id', $branch_id)
            ->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Assets Branch',
            'data' => $assetsBranch
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

        $assetsBranch = AssetsBranch::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Assets Branch Berhasil Ditambahkan!',
            'data' => $assetsBranch
        ], 201);
    }

    public function show($id)
    {
        $assetsBranch = AssetsBranch::find($id);

        if ($assetsBranch) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Branch',
                'data' => $assetsBranch
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

        $assetsBranch = AssetsBranch::find($id);

        if ($assetsBranch) {
            $assetsBranch->update([
                'name' => $request->name,
            ]);

            // return new AssetsBranchResource(true, 'Data Assets Branch Berhasil Diupdate!', $assetsBranch);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Branch Berhasil Diupdate!',
                'data' => $assetsBranch
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }

    public function destroy($id)
    {
        $assetsBranch = AssetsBranch::find($id);

        if ($assetsBranch) {
            $assetsBranch->delete();

            // return new AssetsBranchResource(true, 'Data Assets Branch Berhasil Dihapus!', null);
            return response()->json([
                'success' => true,
                'message' => 'Data Assets Branch Berhasil Dihapus!'
            ], 200);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}
