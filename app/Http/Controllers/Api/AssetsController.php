<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Assets;
use Illuminate\Support\Facades\Auth;

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

            $message[] = $this->getName() . ' mencipta Asset dengan nomor ' . $request['asset_running_number'];

            $request['assets_log'] = $message;

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
                // 'asset_running_number' => 'sometimes',
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

            $message = $this->log('mengemaskini', $request->asset_running_number);

            // Get old logs and append new message
            try {
                // 1) get raw log (could be string, array or null)
                $rawLog = $assets->assets_log;

                // 2) normalize into PHP array
                if (is_string($rawLog)) {
                    $existingLog = json_decode($rawLog, true) ?? [];
                } elseif (is_array($rawLog)) {
                    $existingLog = $rawLog;
                } else {
                    $existingLog = [];
                }

                // 3) append new entry
                $existingLog[] = $message;

                // 4) if your model casts assets_log to array, you can skip json_encode
                //    otherwise, encode it back:
                // $encoded = is_array($rawLog)
                //     ? json_encode($existingLog)
                //     : json_encode($existingLog);

                // 5) return (or update—here we’re just returning for debug)
                // return response()->json([
                //     'log' => $existingLog
                // ]);
            } catch (Exception $error) {
                return response()->json([
                    'message' => 'Terjadi Kesalahan!',
                    'error'   => $error->getMessage()
                ], 500);
            }
            $request['assets_log'] = json_encode($existingLog);

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

    protected function log($action, $running_number)
    {
        $name = $this->getName();
        $message = "$name $action Asset $running_number pada " . date('Y-m-d H:i:s');
        return $message;
    }

    public function getName()
    {
        $user = Auth::user();
        return $user ? $user->name : 'Guest';
    }
}
