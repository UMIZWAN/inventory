<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assets;
use App\Models\AssetsBranchValues;
use App\Models\AssetsBranch;
use App\Models\AssetsCategory;
use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;
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
            // Rows treated as fresh imports (qty > 0) are grouped per branch and turned
            // into one ASSET IN transaction per branch after the row loop.
            $pendingTransactions = [];
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

                    if (!$existingAsset) {
                        $existingAsset = Assets::create([
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
                    }

                    $branchValue = AssetsBranchValues::where('asset_id', $existingAsset->id)
                        ->where('asset_branch_id', $branchId)
                        ->first();

                    $existingQty = (int) ($branchValue->asset_current_unit ?? 0);
                    $newQty = (int) $row['asset_current_unit'];

                    // Fresh stock (no quantity yet) = real import with a transaction record;
                    // anything that already holds stock is an amend.
                    $isImport = $existingQty === 0;

                    if ($branchValue) {
                        $branchValue->update([
                            'asset_current_unit' => $newQty,
                            'asset_location_id' => null,
                            'is_enabled' => true,
                        ]);
                    } else {
                        AssetsBranchValues::create([
                            'asset_id' => $existingAsset->id,
                            'asset_branch_id' => $branchId,
                            'asset_location_id' => null,
                            'asset_current_unit' => $newQty,
                            'is_enabled' => true,
                        ]);
                    }

                    BranchValueLogger::incrementLog($branchId, null, $isImport ? 'CSV IMPORT' : 'CSV IMPORT AMEND', [
                        ['asset_id' => $existingAsset->id, 'asset_unit' => $newQty]
                    ]);

                    // Imports with quantity get an ASSET IN transaction record; zero-quantity imports and amends do not.
                    if ($isImport && $newQty > 0) {
                        $pendingTransactions[$branchId][] = [
                            'asset_id' => $existingAsset->id,
                            'asset_unit' => $newQty,
                            'cost' => is_numeric($row['asset_purchase_cost']) ? (float) $row['asset_purchase_cost'] : 0,
                        ];
                    }

                    $results[] = [
                        'row' => $row,
                        'success' => true,
                        'asset_id' => $existingAsset->id,
                    ];

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

            // One ASSET IN transaction per branch so imported stock shows up in the
            // Item Report / transaction history like a normal stock-in.
            foreach ($pendingTransactions as $branchId => $items) {
                DB::beginTransaction();
                try {
                    $transaction = AssetsTransaction::create([
                        'assets_transaction_running_number' => 'CSV-' . now()->format('YmdHis') . '-' . $branchId,
                        'assets_transaction_type' => 'ASSET IN',
                        'assets_transaction_status' => 'RECEIVED',
                        'assets_from_branch_id' => $branchId,
                        'assets_transaction_remark' => 'Imported via CSV',
                        'assets_transaction_total_cost' => collect($items)->sum(fn($i) => $i['asset_unit'] * $i['cost']),
                        'created_by' => Auth::id(),
                        'received_by' => Auth::id(),
                        'received_at' => now(),
                    ]);

                    foreach ($items as $item) {
                        AssetsTransactionItemList::create([
                            'asset_transaction_id' => $transaction->id,
                            'asset_id' => $item['asset_id'],
                            'asset_unit' => $item['asset_unit'],
                            'status' => null,
                        ]);
                    }

                    DB::commit();
                } catch (Exception $e) {
                    DB::rollBack();
                    $results[] = [
                        'row' => ['name' => 'Transaction record for branch #' . $branchId],
                        'success' => false,
                        'errors' => 'Stock updated but transaction record failed: ' . $e->getMessage(),
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
