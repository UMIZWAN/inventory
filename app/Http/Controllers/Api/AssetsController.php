<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsResource;
use App\Models\Assets;
use App\Models\AssetsBranchValues;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AssetsController extends Controller
{
    public function index()
    {
        try {
            $assets = Assets::with(['category', 'tag', 'branchValues'])->latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'List of Assets',
                'data' => AssetsResource::collection($assets)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }


    public function show($id)
    {
        try {
            $asset = Assets::with(['category', 'tag', 'branchValues'])->find($id);

            if (!$asset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Asset Not Found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Asset Details',
                'data' => new AssetsResource($asset)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'asset_running_number' => 'required|string|max:255|unique:assets',
            'asset_description' => 'nullable|string',
            'asset_type' => 'nullable|string|max:255',
            'asset_category_id' => 'required|exists:assets_category,id',
            'asset_tag_id' => 'required|exists:assets_tag,id',
            'asset_stable_unit' => 'required|integer|min:0',
            'asset_purchase_cost' => 'nullable|numeric|min:0',
            'asset_sales_cost' => 'nullable|numeric|min:0',
            'asset_unit_measure' => 'required|string|max:255',
            'asset_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'assets_remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only([
                'name',
                'asset_running_number',
                'asset_description',
                'asset_type',
                'asset_category_id',
                'asset_tag_id',
                'asset_stable_unit',
                'asset_purchase_cost',
                'asset_sales_cost',
                'asset_unit_measure',
                'assets_remark'
            ]);

            $data['assets_log'] = Auth::user()->name . ' menambahkan aset ' . $request->asset_running_number . ' pada ' . date('Y-m-d H:i:s');

            if ($request->hasFile('asset_image')) {
                $image = $request->file('asset_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('storage/assets'), $imageName);
                $data['asset_image'] = 'storage/assets/' . $imageName;
            }

            $asset = Assets::create($data);

            // Automatically add an entry in assets_branch_values using the current user's branch
            AssetsBranchValues::create([
                'asset_id' => $asset->id,
                'asset_branch_id' => Auth::user()->branch_id,
                'asset_location_id' => $request->assets_location_id ?? null, // optional, may use from form
                'asset_current_unit' => 0,
            ]);

            // If optional: still allow adding additional branch values from frontend (multi-branch)
            if ($request->has('asset_branch_values') && is_array($request->asset_branch_values)) {
                foreach ($request->asset_branch_values as $branchValue) {
                    AssetsBranchValues::create([
                        'asset_id' => $asset->id,
                        'asset_branch_id' => $branchValue['asset_branch_id'],
                        'asset_location_id' => $branchValue['asset_location_id'] ?? null,
                        'asset_current_unit' => $branchValue['asset_current_unit'] ?? 0,
                    ]);
                }
            }

            $asset->load(['category', 'tag', 'branchValues']);

            return response()->json([
                'success' => true,
                'message' => 'Asset created successfully',
                'data' => $asset
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        Log::info($request->all());
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            // 'asset_running_number' => 'required|string|max:255|unique:assets,asset_running_number,' . $id,
            'asset_description' => 'nullable|string',
            'asset_type' => 'nullable|string|max:255',
            'asset_category_id' => 'required|exists:assets_category,id',
            'asset_tag_id' => 'required|exists:assets_tag,id',
            'asset_stable_unit' => 'required|integer|min:0',
            'asset_purchase_cost' => 'nullable|numeric|min:0',
            'asset_sales_cost' => 'nullable|numeric|min:0',
            'asset_unit_measure' => 'required|string|max:255',
            'asset_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'assets_remark' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            Log::info('Validation failed: ', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $asset = Assets::find($id);

            if (!$asset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Asset not found',
                    'data' => null
                ], 404);
            }

            $data = $request->except(['asset_image', 'asset_branch_values']);
            $original = $asset->getOriginal();
            $changes = [];

            Log::info($request->file('asset_image'));
            // Handle image upload if present
            if ($request->hasFile('asset_image')) {
                Log::info('Image detected');
                Log::info($request->file('asset_image'));
                $image = $request->file('asset_image');

                // Validate the image
                if (!$image->isValid()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid image file',
                        'data' => null
                    ], 422);
                }

                // Delete old image if exists
                if ($asset->asset_image && file_exists(public_path($asset->asset_image))) {
                    unlink(public_path($asset->asset_image));
                }

                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('storage/assets'), $imageName);
                $data['asset_image'] = 'storage/assets/' . $imageName;

                $changes['asset_image'] = [
                    'old' => $original['asset_image'] ?? null,
                    'new' => $data['asset_image']
                ];
            }

            // Track other changes
            foreach ($data as $key => $value) {
                if (array_key_exists($key, $original) && $original[$key] != $value) {
                    $changes[$key] = [
                        'old' => $original[$key],
                        'new' => $value,
                    ];
                }
            }

            $asset->update($data);

            if (!empty($changes)) {
                $asset->appendLogSentence('mengemaskini', $changes);
            }

            if ($request->has('asset_branch_values') && is_array($request->asset_branch_values)) {
                foreach ($request->asset_branch_values as $branchValue) {
                    $branch = AssetsBranchValues::where('asset_id', $asset->id)
                        ->where('asset_branch_id', $branchValue['asset_branch_id'])
                        ->first();

                    $branchChanges = [];

                    if ($branch) {
                        if (isset($branchValue['asset_location_id']) && $branch->asset_location_id != $branchValue['asset_location_id']) {
                            $branchChanges['assets_location_id'] = [
                                'old' => $branch->asset_location_id,
                                'new' => $branchValue['asset_location_id']
                            ];
                            $branch->asset_location_id = $branchValue['asset_location_id'];
                        }

                        if (isset($branchValue['asset_current_unit']) && $branch->asset_current_unit != $branchValue['asset_current_unit']) {
                            $branchChanges['asset_current_value'] = [
                                'old' => $branch->asset_current_unit,
                                'new' => $branchValue['asset_current_unit']
                            ];
                            $branch->asset_current_unit = $branchValue['asset_current_unit'];
                        }

                        $branch->save();
                    } else {
                        $branch = AssetsBranchValues::create([
                            'asset_id' => $asset->id,
                            'asset_branch_id' => $branchValue['asset_branch_id'],
                            'asset_location_id' => $branchValue['asset_location_id'] ?? null,
                            'asset_current_unit' => $branchValue['asset_current_unit'] ?? 0,
                        ]);

                        $branchChanges['assets_branch_id'] = [
                            'old' => null,
                            'new' => $branchValue['asset_branch_id']
                        ];
                        $branchChanges['assets_location_id'] = [
                            'old' => null,
                            'new' => $branchValue['asset_location_id'] ?? null
                        ];
                        $branchChanges['asset_current_value'] = [
                            'old' => 0,
                            'new' => $branchValue['asset_current_unit'] ?? 0
                        ];
                    }

                    if (!empty($branchChanges)) {
                        $asset->appendLogSentence('mengemaskini cabang', $branchChanges);
                    }
                }
            }

            $asset->load(['category', 'tag', 'branchValues']);

            return response()->json([
                'success' => true,
                'message' => 'Asset updated successfully',
                'data' => $asset
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function destroy($id)
    {
        $asset = Assets::find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found',
                'data' => null
            ], 404);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully',
            'data' => null
        ], 200);
    }
}
