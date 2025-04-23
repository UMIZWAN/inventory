<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Assets;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\AssetsResource;

class AssetsController extends Controller
{
    public function index()
    {
        try {
            $assets = Assets::with(['category', 'branch', 'tag', 'location'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Data Assets Berhasil Ditampilkan!',
                'data' => AssetsResource::collection($assets),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $assets = Assets::with(['branch', 'tag', 'category', 'location'])->find($id);
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
                'data' => new AssetsResource($assets),
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'asset_running_number' => 'required|string|max:255',
                'asset_description' => 'nullable|string',
                'asset_type' => 'nullable|string',
                'asset_category_id' => 'bail|required|integer|min:1|exists:assets_category,id',
                'asset_tag_id'      => 'bail|required|integer|min:1|exists:assets_tag,id',
                // 'asset_stable_value' => 'bail|required|integer|min:1',
                // 'asset_current_value' => 'bail|required|integer|min:1',
                'asset_purchase_cost' => 'bail|required|numeric|min:0',
                'asset_sales_cost' => 'bail|nullable|numeric|min:0',
                'asset_unit_measure' => 'bail|required|string',
                'assets_branch_id' => 'bail|required|integer|min:1|exists:assets_branch,id',
                'assets_location_id' => 'bail|required|integer|min:1|exists:assets_branch,id',
                'asset_image' => 'nullable|string',
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

            $username = Auth::user()->name ?? 'Unknown';
            $message[] = $username . ' mencipta Asset dengan nomor ' . $request['asset_running_number'];

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

    /**
     * Update an existing asset, tracking changes as transaction history.
     */
    public function update(Request $request, Assets $asset)
    {
        try {
            // 1️⃣ Validate input data
            $validator = Validator::make($request->all(), [
                'name'                 => 'sometimes|string|max:255',
                'asset_running_number' => 'sometimes|string|max:255',
                'asset_description'    => 'sometimes|string',
                'asset_type'           => 'sometimes|string|max:100',
                'asset_category_id'    => 'sometimes|integer|exists:assets_category,id',
                'asset_tag_id'         => 'sometimes|integer|exists:assets_tag,id',
                'asset_stable_value'   => 'sometimes|numeric|min:0',
                'asset_current_value'  => 'sometimes|numeric|min:0',
                'asset_purchase_cost'  => 'sometimes|numeric|min:0',
                'asset_sales_cost'     => 'sometimes|numeric|min:0',
                'asset_unit_measure'   => 'sometimes|string|max:100',
                'assets_branch_id'     => 'sometimes|integer|exists:assets_branch,id',
                'assets_location_id'   => 'sometimes|integer|exists:assets_branch,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Gagal Disimpan!',
                    'data' => $validator->errors()
                ], 422);
            }

            // 2️⃣ Track changes - compare original values with new values
            $changes = [];
            $requestData = $request->all();

            // Only check fillable fields that are present in the request
            $fillableFields = $asset->getFillable();
            foreach ($fillableFields as $field) {
                if (!array_key_exists($field, $requestData)) {
                    continue; // Skip if field not provided in request
                }

                $oldValue = $asset->$field;
                $newValue = $requestData[$field];

                // Handle array values
                if (is_array($newValue) || is_array($oldValue)) {
                    $oldValueStr = is_array($oldValue) ? json_encode($oldValue) : (string)$oldValue;
                    $newValueStr = is_array($newValue) ? json_encode($newValue) : (string)$newValue;
                } else {
                    $oldValueStr = (string)$oldValue;
                    $newValueStr = (string)$newValue;
                }

                // Only record if values are different
                if ($oldValueStr !== $newValueStr) {
                    $changes[$field] = ['old' => $oldValueStr, 'new' => $newValueStr];
                }
            }

            // 3️⃣ Apply changes
            $asset->fill($requestData);
            $asset->save(); // Actually save the changes to the database

            // 4️⃣ Append a descriptive log entry
            if (!empty($changes)) {
                $asset->appendLogSentence('mengemaskini', $changes);
            }

            // 5️⃣ Return updated asset
            return response()->json([
                'success' => true,
                'message' => 'Data Berhasil Diupdate!',
                'data'    => $requestData,
                'assets_log' => $asset->assets_log
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi Kesalahan!',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
