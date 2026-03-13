<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assets;
use App\Models\AssetsBranchValues;
use App\Models\AssetsBranch;
use App\Models\AssetsCategory;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Helpers\BranchValueLogger;

class AssetsImportController extends Controller
{
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

                            BranchValueLogger::incrementLog($branchId, null, 'CSV IMPORT', [
                                ['asset_id' => $existingAsset->id, 'asset_unit' => $row['asset_current_unit']]
                            ]);
                        } else {
                            AssetsBranchValues::where('asset_id', $existingAsset->id)
                                ->where('asset_branch_id', $branchId)
                                ->update([
                                    'asset_current_unit' => $row['asset_current_unit'],
                                    'asset_location_id' => null,
                                ]);

                            BranchValueLogger::incrementLog($branchId, null, 'CSV IMPORT AMEND', [
                                ['asset_id' => $existingAsset->id, 'asset_unit' => $row['asset_current_unit']]
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
                            'asset_type' => $row['asset_type'] ?? null,
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

                        BranchValueLogger::incrementLog($branchId, null, 'CSV IMPORT', [
                            ['asset_id' => $asset->id, 'asset_unit' => $row['asset_current_unit']]
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

    private function sanitizeCurrency($value)
    {
        if (is_null($value)) return null;

        return preg_replace('/[^\d.]/', '', str_replace(',', '', $value));
    }
}
