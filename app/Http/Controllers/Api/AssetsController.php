<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsResource;
use App\Models\Assets;
use App\Models\AssetsBranchValues;
use App\Models\AssetsBranch;
use App\Models\AssetsCategory;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AssetsController extends Controller
{
    public function index()
    {
        try {
            $assets = Assets::with(['category', 'tag', 'branchValues'])->latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'List of Assets',
                'data' => AssetsResource::collection(
                    Cache::remember('assets_cache', 3600, function () use ($assets) {
                        return $assets;
                    })
                )
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
            // 'asset_tag_id' => 'required|exists:assets_tag,id',
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

            // Get all branches from the database
            $branches = DB::table('assets_branch')->get();

            // If optional: still allow adding additional branch values from frontend (multi-branch)
            if ($request->has('asset_branch_values') && is_array($request->asset_branch_values)) {
                foreach ($request->asset_branch_values as $branchValue) {
                    AssetsBranchValues::create([
                        'asset_id' => $asset->id,
                        'asset_branch_id' => $branchValue['asset_branch_id'],
                        'asset_location_id' => null,
                        'asset_current_unit' => $branchValue['asset_current_unit'] ?? 0,
                    ]);
                }
            } else {
                // Create an entry in assets_branch_values for each branch
                foreach ($branches as $branch) {
                    if (str_starts_with($branch->name, 'HQ')) {
                        AssetsBranchValues::create([
                            'asset_id' => $asset->id,
                            'asset_branch_id' => $branch->id,
                            'asset_location_id' => null,
                            'asset_current_unit' => 0,
                        ]);
                    }
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
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            // 'asset_running_number' => 'required|string|max:255|unique:assets,asset_running_number,' . $id,
            'asset_description' => 'nullable|string',
            'asset_type' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:assets_category,id',
            // 'asset_tag_id' => 'required|exists:assets_tag,id',
            'asset_stable_unit' => 'nullable|integer|min:0',
            'asset_purchase_cost' => 'nullable|numeric|min:0',
            'asset_sales_cost' => 'nullable|numeric|min:0',
            'asset_unit_measure' => 'nullable|string|max:255',
            'asset_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'assets_remark' => 'nullable|string'
        ]);

        if ($validator->fails()) {
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

            $inputKeys = array_keys($request->all());
            $data = collect($request->only($inputKeys))
                ->except(['asset_image', 'asset_branch_values'])
                ->toArray();

            $original = $asset->getOriginal();
            $changes = [];

            // Handle image upload if present
            if ($request->hasFile('asset_image')) {
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

    public function copyItems($id)
    {
        try {
            $asset = Assets::find($id);
            if (!$asset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Asset not found',
                    'data' => null
                ], 404);
            }

            $latestId = Assets::max('id');

            $new_running_no = $asset->asset_running_number . '-COPY' . $latestId;

            $newAsset = Assets::create([
                'name' => $asset->name,
                'asset_running_number' => $new_running_no,
                'asset_description' => $asset->asset_description ?? null,
                'asset_type' => $asset->asset_type ?? null,
                'asset_category_id' => $asset->asset_category_id,
                'asset_stable_unit' => $asset->asset_stable_unit,
                'asset_purchase_cost' => $asset->asset_purchase_cost ?? null,
                'asset_sales_cost' => $asset->asset_sales_cost ?? null,
                'asset_unit_measure' => $asset->asset_unit_measure,
                'asset_image' => $asset->asset_image ?? null,
                'assets_remark' => $asset->assets_remark ?? null,
                'assets_log' => Auth::user()->name . ' menambahkan aset ' . $asset->asset_running_number . ' pada ' . date('Y-m-d H:i:s'),

            ]);

            $branches = DB::table('assets_branch')->get();

            // Create an entry in assets_branch_values for each branch
            foreach ($branches as $branch) {
                if (str_starts_with($branch->name, 'HQ')) {
                    AssetsBranchValues::create([
                        'asset_id' => $newAsset->id,
                        'asset_branch_id' => $branch->id,
                        'asset_location_id' => null,
                        'asset_current_unit' => 0,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Asset copied successfully',
                'data' => $newAsset
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByBranch(Request $request)
    {
        try {
            $branchId = $request->input('branch_id', Auth::user()->branch_id);

            // Optional query parameters
            $perPage = $request->input('per_page', 10); // default to 10 per page
            $search = $request->search;
            $type = $request->type;
            $categoryId = $request->input('asset_category_id');

            $query = Assets::with(['category', 'tag'])
                ->whereHas('branchValues', function ($query) use ($branchId) {
                    $query->where('asset_branch_id', $branchId);
                })
                ->with(['branchValues' => function ($query) use ($branchId) {
                    $query->where('asset_branch_id', $branchId);
                }]);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('asset_running_number', 'like', "%$search%")
                        ->orWhere('name', 'like', "%$search%");
                });
            }

            if ($type) {
                $query->where(function ($q) use ($type) {
                    $q->where('asset_type', 'like', "%$type%");
                });
            }

            if (!empty($categoryId)) {
                $query->where('asset_category_id', $categoryId);
            }

            $assets = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'List Data Assets',
                'data' => AssetsResource::collection($assets),
                'pagination' => [
                    'current_page' => $assets->currentPage(),
                    'last_page' => $assets->lastPage(),
                    'per_page' => $assets->perPage(),
                    'total' => $assets->total(),
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function importFromCSV(Request $request)
    {
        try {
            $request->validate([
                'csv_file' => 'required|file|mimes:csv,txt',
            ]);

            $path = $request->file('csv_file')->getRealPath();

            $rows = [];
            if (($handle = fopen($path, 'r')) !== false) {
                // Read the header
                $header = fgetcsv($handle);
                $header = array_map('trim', $header);

                // Read the rest of the rows
                while (($data = fgetcsv($handle)) !== false) {
                    // Combine header and data
                    $row = array_combine($header, $data);

                    // Clean multiline fields, e.g. name and description
                    if (isset($row['name'])) {
                        $row['name'] = preg_replace("/[\r\n]+/", " ", trim($row['name']));
                    }
                    if (isset($row['asset_description'])) {
                        $row['asset_description'] = preg_replace("/[\r\n]+/", " ", trim($row['asset_description']));
                    }

                    $rows[] = $row;
                }
                fclose($handle);
            } else {
                throw new Exception('Unable to open CSV file');
            }

            $results = [];
            foreach ($rows as $row) {
                // Sanitize currency values
                $row['asset_purchase_cost'] = $this->sanitizeCurrency($row['asset_purchase_cost'] ?? null);
                $row['asset_sales_cost'] = $this->sanitizeCurrency($row['asset_sales_cost'] ?? null);

                // Validation and rest of your code unchanged...
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'asset_running_number' => 'required|string|max:255',
                    'asset_category' => 'required|string|max:255',
                    'asset_stable_unit' => 'required|integer|min:0',
                    'asset_purchase_cost' => 'nullable|numeric|min:0',
                    'asset_sales_cost' => 'nullable|numeric|min:0',
                    'asset_unit_measure' => 'required|string|max:255',
                    'asset_branch' => 'required|string|max:255',
                    'asset_current_unit' => 'required|integer|min:0',
                    'asset_description' => 'nullable|string',
                ]);

                if ($validator->fails()) {
                    $results[] = [
                        'row' => $row,
                        'success' => false,
                        'errors' => $validator->errors(),
                    ];
                    continue;
                }

                DB::beginTransaction();
                try {
                    // Your existing DB logic here (unchanged) ...
                    $branchId = AssetsBranch::firstOrCreate(['name' => $row['asset_branch']])->id;
                    $categoryId = AssetsCategory::firstOrCreate(['name' => $row['asset_category']])->id;

                    $existingAsset = Assets::where('asset_running_number', $row['asset_running_number'])->first();

                    if ($existingAsset) {
                        $exists = AssetsBranchValues::where('asset_id', $existingAsset->id)
                            ->where('asset_branch_id', $branchId)
                            ->exists();

                        if (!$exists) {
                            AssetsBranchValues::create([
                                'asset_id' => $existingAsset->id,
                                'asset_branch_id' => $branchId,
                                'asset_location_id' => null,
                                'asset_current_unit' => $row['asset_current_unit'],
                            ]);
                        }

                        $results[] = [
                            'row' => $row,
                            'success' => true,
                            'asset_id' => $existingAsset->id,
                        ];
                    } else {
                        $asset = Assets::create([
                            'name' => $row['name'],
                            'asset_running_number' => $row['asset_running_number'],
                            'asset_category_id' => $categoryId,
                            'asset_stable_unit' => $row['asset_stable_unit'],
                            'asset_purchase_cost' => is_numeric($row['asset_purchase_cost']) ? $row['asset_purchase_cost'] : null,
                            'asset_sales_cost' => is_numeric($row['asset_sales_cost']) ? $row['asset_sales_cost'] : null,
                            'asset_unit_measure' => $row['asset_unit_measure'],
                            'asset_description' => $row['asset_description'] ?? '',
                            'assets_log' => Auth::user()->name . ' imported asset via CSV on ' . now(),
                        ]);

                        AssetsBranchValues::create([
                            'asset_id' => $asset->id,
                            'asset_branch_id' => $branchId,
                            'asset_location_id' => null,
                            'asset_current_unit' => $row['asset_current_unit'],
                        ]);

                        $results[] = [
                            'row' => $row,
                            'success' => true,
                            'asset_id' => $asset->id,
                        ];
                    }

                    DB::commit();
                } catch (Exception $e) {
                    DB::rollBack();
                    $results[] = [
                        'row' => $row,
                        'success' => false,
                        'errors' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Import complete',
                'results' => $results,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }


    // Add this helper method to the same controller
    private function sanitizeCurrency($value)
    {
        if (is_null($value)) return null;

        // Remove commas and anything that is not a digit or a dot
        return preg_replace('/[^\d.]/', '', str_replace(',', '', $value));
    }


    public function getAssetList()
    {
        $assets = Assets::with(['category', 'tag', 'branchValues'])->latest()->get();

        if ($assets->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No assets found',
                'data' => []
            ], 404);
        }

        $formattedAssets = $assets->map(function ($asset) {
            return [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_running_number' => $asset->asset_running_number,
                'asset_category_id' => $asset->asset_category_id,
                'asset_category_name' => $asset->category->name ?? null,
                'asset_purchase_cost' => $asset->asset_purchase_cost,
                'asset_sales_cost' => $asset->asset_sales_cost,
                'asset_unit_measure' => $asset->asset_unit_measure,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'List Data Assets',
            'data' => $formattedAssets
        ], 200);
    }

    public function getListByBranch(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'asset_branch_id' => 'required|exists:assets_branch,id',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'data' => $validator->errors()
                ], 422);
            }

            // Validate the branch ID
            $branchId = $request->asset_branch_id;

            $assets = Assets::with(['category', 'tag'])
                ->whereHas('branchValues', function ($query) use ($branchId) {
                    $query->where('asset_branch_id', $branchId);
                })
                ->with(['branchValues' => function ($query) use ($branchId) {
                    $query->where('asset_branch_id', $branchId);
                }])
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'List Data Assets',
                'data' => AssetsResource::collection($assets),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
