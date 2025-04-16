<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Assets;

class AssetsController extends Controller
{
    public function index()
    {
        $assets = Assets::all();
        return response()->json([
            'success' => true,
            'message' => 'Data Assets Berhasil Ditampilkan!',
            'data' => $assets
        ], 200);
    }

    public function show($id)
    {
        $assets = Assets::find($id);
        if ($assets) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets!',
                'data' => $assets
            ], 200);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Data Assets Tidak Ditemukan!',
                'data' => $assets
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'asset_running_number' => 'required',
                'asset_type' => 'required',
                'asset_category_id' => 'required',
                'asset_tag_id' => 'required',
                'asset_stable_value' => 'required',
                'asset_current_value' => 'required',
                'assets_branch_id' => 'required',
                'assets_location' => 'required',
                'assets_remark' => 'nullable',
                'assets_log' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Gagal Disimpan!',
                    'data' => $validator->errors()
                ], 422);
            }

            $assets = Assets::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Data Berhasil Disimpan!',
                'data' => $assets
            ], 201);
        } catch (Exception $error) {
            return response()->json([
                'message' => 'Terjadi Kesalahan!',
                'error' => $error->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes',
                'asset_running_number' => 'sometimes',
                'asset_type' => 'sometimes',
                'asset_category_id' => 'sometimes',
                'asset_tag_id' => 'sometimes',
                'asset_stable_value' => 'sometimes',
                'asset_current_value' => 'sometimes',
                'assets_branch_id' => 'sometimes',
                'assets_location' => 'sometimes',
                'assets_remark' => 'nullable',
                'assets_log' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Gagal Disimpan!',
                    'data' => $validator->errors()
                ], 422);
            }

            $assets = Assets::find($id);

            if (!$assets) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Tidak Ditemukan!',
                    'data' => $assets
                ], 404);
            }

            $assets->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Data Berhasil Diupdate!',
                'data' => $assets
            ], 200);
        } catch (Exception $error) {
            return response()->json([
                'message' => 'Terjadi Kesalahan!',
                'error' => $error->getMessage()
            ], 500);
        }
    }
}
