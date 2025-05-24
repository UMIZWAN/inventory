<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsTransactionResource;
use App\Http\Resources\ReportResource;
use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AssetsBranchValues;
use App\Models\Assets;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\ShippingOption;
use App\Models\Tax;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\TransactionHistoryResource;
use App\Models\AssetsBranch;

class AssetsTransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $assetsTransactions = AssetsTransaction::with([
                'transactionItems',
                'fromBranch',
                'toBranch',
                'createdBy',
            ])->latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'List Data Assets Transactions',
                'data' => AssetsTransactionResource::collection($assetsTransactions)
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
            $assetsTransaction = AssetsTransaction::with([
                'transactionItems',
                'fromBranch',
                'toBranch',
                'createdBy',
            ])->find($id);

            if (!$assetsTransaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assets Transaction not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail Data Assets Transaction',
                'data' => new AssetsTransactionResource($assetsTransaction)
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
        try {
            if ($request->assets_transaction_type == null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => 'Assets transaction type is required'
                ], 422);
            }
            if ($request->assets_transaction_type != 'ASSET IN') {
                $request['assets_transaction_running_number'] = $this->generateNextRunningNumber($request->assets_transaction_type);
            }


            if ($request->assets_transaction_type == 'ASSET OUT') {

                $validator = Validator::make($request->all(), [
                    'assets_transaction_type' => 'required|string',
                    'assets_recipient_name' => 'nullable|string',
                    'assets_from_branch_id' => 'required|integer',
                    'created_by' => 'required|integer|exists:users,id',
                    'created_at' => 'nullable|date',
                    'assets_transaction_purpose_id' => 'required|integer',
                    'assets_transaction_item_list' => 'required|array|min:1',
                    'assets_transaction_item_list.*.asset_id' => 'required|integer|exists:assets,id',
                    'assets_transaction_item_list.*.status' => 'nullable|string|in:ON HOLD,DELIVERED,FROZEN,RECEIVED,RETURNED,DISPOSED',
                    'assets_transaction_item_list.*.asset_unit' => 'required|integer',
                    'attachment' => 'nullable|file|mimes:pdf,xls,xlsx,doc,docx|max:10240', // Added attachment validation (max 10MB)
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => $validator->errors()
                    ], 422);
                }


                DB::beginTransaction();

                try {
                    $attachmentPath = null;
                    // Handle attachment upload
                    if ($request->hasFile('attachment')) {
                        $attachment = $request->file('attachment');
                        // Store the file in the 'public/attachments' directory
                        $attachmentPath = $attachment->store('public/attachments');
                        // Get the URL for the stored file (optional, depends on how you serve files)
                        // You might want to use Storage::url($attachmentPath) if serving directly via public disk
                    }

                    $transaction = AssetsTransaction::create([
                        'assets_transaction_running_number' => $request->assets_transaction_running_number,
                        'assets_transaction_type' => $request->assets_transaction_type,
                        'assets_recipient_name' => $request->assets_recipient_name,
                        'assets_transaction_remark' => $request->assets_transaction_remark,
                        'assets_transaction_purpose_id' => $request->assets_transaction_purpose_id,
                        'assets_from_branch_id' => $request->assets_from_branch_id,
                        'assets_transaction_total_cost' => $request->assets_transaction_total_cost,
                        'created_by' => $request->created_by,
                        'created_at' => $request->created_at,
                        'attachment' => $attachmentPath, // Save the stored path
                    ]);

                    foreach ($request->assets_transaction_item_list as $item) {
                        AssetsTransactionItemList::create([
                            'asset_transaction_id' => $transaction->id,
                            'asset_id' => $item['asset_id'],
                            'status' => $item['status'],
                            'asset_unit' => $item['asset_unit']
                        ]);
                    }

                    foreach ($request->assets_transaction_item_list as $item) {
                        $assetBranchValue = AssetsBranchValues::where('asset_branch_id', $request->assets_from_branch_id)
                            ->where('asset_id', $item['asset_id'])
                            ->first();

                        if ($assetBranchValue) {
                            $assetBranchValue->decrement('asset_current_unit', $item['asset_unit']);
                        }
                    }

                    DB::commit();

                    return response()->json([
                        'success' => true,
                        'message' => 'Asset transaction ' . $transaction->assets_transaction_running_number . ' created successfully',
                        'data' => $transaction->load('transactionItems', 'fromBranch', 'purpose', 'createdBy')
                    ], 201);
                } catch (\Exception $e) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create asset transaction.',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            if ($request->assets_transaction_type == 'ASSET IN') {
                $validator = Validator::make($request->all(), [
                    'assets_transaction_running_number' => 'required|string|unique:assets_transaction,assets_transaction_running_number',
                    'supplier_id' => 'nullable|integer|exists:suppliers,id',
                    'assets_transaction_type' => 'required|string',
                    'assets_from_branch_id' => 'required|integer',
                    'created_by' => 'required|integer|exists:users,id',
                    'received_at' => 'nullable|date',
                    'assets_transaction_total_cost' => 'required|numeric',
                    'assets_transaction_item_list' => 'required|array|min:1',
                    'assets_transaction_item_list.*.asset_id' => 'required|integer|exists:assets,id',
                    'assets_transaction_item_list.*.status' => 'nullable|string|in:ON HOLD,DELIVERED,FROZEN,RECEIVED,RETURNED,DISPOSED',
                    'assets_transaction_item_list.*.asset_unit' => 'required|integer',
                    'assets_transaction_item_list.*.asset_sales_cost' => 'nullable|numeric|min:0',
                    'assets_transaction_item_list.*.asset_purchase_cost' => 'nullable|numeric|min:0',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => $validator->errors()
                    ], 422);
                }

                DB::beginTransaction();

                $transaction = AssetsTransaction::create($request->only([
                    'assets_transaction_running_number',
                    'supplier_id',
                    'assets_transaction_type',
                    'assets_transaction_remark',
                    'assets_from_branch_id',
                    'assets_transaction_total_cost',
                    'created_by',
                    'created_at',
                    'received_at',
                ]));

                foreach ($request->assets_transaction_item_list as $item) {
                    if (!empty($item['purchase_order_id'])) {
                        $existing = AssetsTransactionItemList::where('purchase_order_id', $item['purchase_order_id'])
                            ->where('asset_id', $item['asset_id'])
                            ->first();

                        if ($existing) {
                            $existing->update([
                                'asset_transaction_id' => $transaction->id,
                                'status' => $item['status'],
                                'asset_unit' => $item['asset_unit']
                            ]);
                            continue;
                        }
                    }

                    AssetsTransactionItemList::create([
                        'asset_transaction_id' => $transaction->id,
                        'purchase_order_id' => $item['purchase_order_id'] ?? null,
                        'asset_id' => $item['asset_id'],
                        'status' => $item['status'],
                        'asset_unit' => $item['asset_unit']
                    ]);
                }

                foreach ($request->assets_transaction_item_list as $item) {
                    $assetBranchValue = AssetsBranchValues::where('asset_branch_id', $request->assets_from_branch_id)
                        ->where('asset_id', $item['asset_id'])
                        ->first();

                    $updateData = [];

                    if ($item['asset_sales_cost']) {
                        $updateData['asset_sales_cost'] = $item['asset_sales_cost'];
                    }

                    if ($item['asset_purchase_cost']) {
                        $updateData['asset_purchase_cost'] = $item['asset_purchase_cost'];
                    }

                    if (!empty($updateData)) {
                        Assets::where('id', $item['asset_id'])->update($updateData);
                    }

                    if ($assetBranchValue) {
                        $assetBranchValue->increment('asset_current_unit', $item['asset_unit']);
                    } else {
                        AssetsBranchValues::create([
                            'asset_branch_id' => $transaction->assets_from_branch_id,
                            'asset_location_id' => null,
                            'asset_id' => $item['asset_id'],
                            'asset_current_unit' => $item['asset_unit'],
                            'asset_min_unit' => 0,
                            'asset_max_unit' => 0,
                            'created_by' => Auth::user()->id,
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Asset transaction ' . $transaction->assets_transaction_running_number . ' created successfully',
                    'data' => $transaction->load('transactionItems')
                ], 201);
            }

            if ($request->assets_transaction_type == 'ASSET TRANSFER') {
                $validator = Validator::make($request->all(), [
                    'assets_transaction_running_number' => 'required|string|unique:assets_transaction,assets_transaction_running_number',
                    'assets_transaction_type' => 'required|string',
                    'assets_from_branch_id' => 'required|integer',
                    'assets_to_branch_id' => 'required|integer',
                    'assets_transaction_total_cost' => 'required|numeric',
                    'created_by' => 'required|integer|exists:users,id',
                    'created_at' => 'nullable|date',
                    'assets_transaction_item_list' => 'required|array|min:1',
                    'assets_transaction_item_list.*.asset_id' => 'required|integer|exists:assets,id',
                    'assets_transaction_item_list.*.status' => 'nullable|string|in:ON HOLD,DELIVERED,FROZEN,RECEIVED,RETURNED,DISPOSED',
                    'assets_transaction_item_list.*.asset_unit' => 'required|integer'
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => $validator->errors()
                    ], 422);
                }

                DB::beginTransaction();

                $transaction = AssetsTransaction::create([
                    'assets_transaction_running_number' => $request->assets_transaction_running_number,
                    'assets_transaction_type' => $request->assets_transaction_type,
                    'assets_shipping_option_id' => $request->assets_shipping_option_id,
                    // 'assets_transaction_status' => 'REQUESTED',
                    'assets_transaction_status' => $request->assets_transaction_status,
                    'assets_transaction_purpose' => $request->has('assets_transaction_purpose') ? json_encode($request->assets_transaction_purpose) : null,
                    'assets_transaction_remark' => $request->assets_transaction_remark,
                    'assets_from_branch_id' => $request->assets_from_branch_id,
                    'assets_to_branch_id' => $request->assets_to_branch_id,
                    'assets_transaction_total_cost' => $request->assets_transaction_total_cost,
                    'created_by' => $request->created_by,
                    'created_at' => $request->created_at,
                ]);

                foreach ($request->assets_transaction_item_list as $item) {
                    AssetsTransactionItemList::create([
                        'asset_transaction_id' => $transaction->id,
                        'asset_id' => $item['asset_id'],
                        'status' => $item['status'],
                        'asset_unit' => $item['asset_unit']
                    ]);

                    if ($request->assets_transaction_status == 'IN-TRANSIT') {
                        $assetBranchValue = AssetsBranchValues::where('asset_branch_id', $request->assets_from_branch_id)
                            ->where('asset_id', $item['asset_id'])
                            ->first();

                        if ($assetBranchValue) {
                            $assetBranchValue->decrement('asset_current_unit', $item['asset_unit']);
                        }
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Asset transfer ' . $transaction->assets_transaction_running_number . ' created successfully',
                    'data' => $transaction->load('transactionItems')
                ], 201);
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'assets_transaction_status' => 'required|in:REQUESTED,REJECTED,APPROVED,IN-TRANSIT,RECEIVED,IN PROGRESS,COMPLETED',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $transaction = AssetsTransaction::findOrFail($id);

            if ($transaction->assets_transaction_type == 'ASSET TRANSFER') {
                if ($request->assets_transaction_status == $transaction->assets_transaction_status) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Asset transfer already ' . $transaction->assets_transaction_status
                    ], 400);
                }


                if ($request->assets_transaction_status == 'REJECTED' && $transaction->assets_transaction_status == 'REQUESTED') {
                    DB::beginTransaction();
                    $transaction->update([
                        'assets_transaction_status' => $request->assets_transaction_status,
                        'assets_transaction_remark' => $request->assets_transaction_remark ?? $transaction->assets_transaction_remark,
                        'rejected_by' => Auth::user()->id,
                        'rejected_at' => Carbon::now()
                    ]);

                    DB::commit();

                    return response()->json([
                        'message' => 'Asset Rejected successfully',
                        'data' => new AssetsTransactionResource($transaction)
                    ], 200);
                }
                if ($request->assets_transaction_status == 'APPROVED' && $transaction->assets_transaction_status == 'REQUESTED') {
                    DB::beginTransaction();
                    $transaction->update([
                        'assets_transaction_status' => $request->assets_transaction_status,
                        'assets_transaction_remark' => $request->assets_transaction_remark ?? $transaction->assets_transaction_remark,
                        'approved_by' => Auth::user()->id,
                        'approved_at' => Carbon::now()
                    ]);

                    DB::commit();

                    return response()->json([
                        'message' => 'Asset Approved successfully',
                        'data' => new AssetsTransactionResource($transaction)
                    ], 200);
                }
                if ($request->assets_transaction_status == 'IN-TRANSIT' && $transaction->assets_transaction_status == 'APPROVED') {
                    DB::beginTransaction();
                    try {
                        $transactionItems = AssetsTransactionItemList::where('asset_transaction_id', $transaction->id)->get();

                        foreach ($transactionItems as $item) {
                            $assetBranchFromValue = AssetsBranchValues::where('asset_branch_id', $transaction->assets_from_branch_id)
                                ->where('asset_id', $item['asset_id'])
                                ->first();

                            if (!$assetBranchFromValue || $assetBranchFromValue->asset_current_unit < $item['asset_unit']) {
                                throw new Exception('Insufficient asset units in the source branch.');
                            }
                            if ($request->assets_shipping_option_id == null) {
                                throw new Exception("Shipping option ID cannot be empty.");
                            }
                        }

                        // All checks passed, now update status and decrement
                        $transaction->update([
                            'assets_transaction_status' => $request->assets_transaction_status,
                            'assets_shipping_option_id' => $request->assets_shipping_option_id,
                            'assets_transaction_remark' => $request->assets_transaction_remark ?? $transaction->assets_transaction_remark,
                            'updated_by' => Auth::id(),
                            'updated_at' => Carbon::now()
                        ]);

                        foreach ($transactionItems as $item) {
                            $assetBranchFromValue = AssetsBranchValues::where('asset_branch_id', $transaction->assets_from_branch_id)
                                ->where('asset_id', $item['asset_id'])
                                ->first();

                            $assetBranchFromValue->decrement('asset_current_unit', $item['asset_unit']);
                        }

                        DB::commit();

                        return response()->json([
                            'message' => 'Asset Sent successfully',
                            'data' => new AssetsTransactionResource($transaction)
                        ], 200);
                    } catch (Exception $e) {
                        DB::rollback();
                        return response()->json([
                            'message' => 'An error occurred while sending the asset.',
                            'error' => $e->getMessage()
                        ], 500);
                    }
                }

                if ($request->assets_transaction_status == 'RECEIVED' && $transaction->assets_transaction_status == 'IN-TRANSIT') {

                    $transaction->update([
                        'assets_transaction_status' => $request->assets_transaction_status,
                        'assets_transaction_remark' => $request->assets_transaction_remark ?? $transaction->assets_transaction_remark,
                        'received_by' => Auth::user()->id,
                        'received_at' => Carbon::now()
                    ]);
                    $transactionItems = AssetsTransactionItemList::where('asset_transaction_id', $transaction->id)->get();

                    foreach ($transactionItems as $item) {
                        $item->update(['status' => 'RECEIVED']);

                        $assetBranchToValue = AssetsBranchValues::where('asset_branch_id', $transaction->assets_to_branch_id)
                            ->where('asset_id', $item->asset_id)
                            ->first();

                        if ($assetBranchToValue) {
                            $assetBranchToValue->increment('asset_current_unit', $item->asset_unit);
                        } else {
                            AssetsBranchValues::create([
                                'asset_branch_id' => $transaction->assets_to_branch_id,
                                'asset_location_id' => $transaction->assets_to_branch_id,
                                'asset_id' => $item->asset_id,
                                'asset_current_unit' => $item->asset_unit,
                                'asset_min_unit' => 0,
                                'asset_max_unit' => 0,
                                'created_by' => Auth::user()->id,
                            ]);
                        }
                    }
                    DB::commit();

                    return response()->json([
                        'message' => 'Asset received successfully',
                        'data' => new AssetsTransactionResource($transaction)
                    ], 200);
                }
            }

            if ($transaction->assets_transaction_type == 'ASSET OUT' && $transaction->assets_transaction_status == 'IN PROGRESS') {

                $validator = Validator::make($request->all(), [
                    'assets_transaction_item_list.*.asset_unit' => 'required|integer'
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => $validator->errors()
                    ], 422);
                }

                // $transactionItems = AssetsTransactionItemList::where('asset_transaction_id', $transaction->id)->get();

                try {
                    DB::beginTransaction();

                    foreach ($request->input('assets_transaction_item_list') as $inputItem) {
                        $assetId = $inputItem['asset_id'];
                        $assetUnit = $inputItem['asset_unit'];
                        // Get the matching item from DB
                        $transactionItem = AssetsTransactionItemList::where('asset_transaction_id', $transaction->id)
                            ->where('asset_id', $assetId)
                            ->first();

                        if ($assetUnit > $transactionItem->asset_unit) {
                            throw new Exception("Cannot receive more than available units for Asset ID {$assetId}");
                        }

                        if (!$transactionItem) {
                            continue; // Or handle this case with a warning if needed
                        }

                        // Calculate new value
                        $used = $transactionItem->asset_unit - $assetUnit;

                        $transactionItem->update([
                            'asset_unit' => $used
                        ]);

                        $assetBranchToValue = AssetsBranchValues::where('asset_branch_id', $transaction->assets_from_branch_id)
                            ->where('asset_id', $assetId)
                            ->first();

                        if ($assetBranchToValue) {
                            $assetBranchToValue->increment('asset_current_unit', $assetUnit);
                        }
                    }

                    $transaction->update([
                        'assets_transaction_status' => $request->assets_transaction_status,
                        'assets_transaction_remark' => $request->assets_transaction_remark ?? $transaction->assets_transaction_remark,
                        'received_by' => Auth::user()->id,
                        'received_at' => Carbon::now()
                    ]);

                    DB::commit();

                    return response()->json([
                        'message' => 'Asset received successfully',
                        'data' => new AssetsTransactionResource($transaction)
                    ], 200);
                } catch (Exception $e) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process asset out transaction',
                        'error' => env('APP_DEBUG') ? $e->getMessage() : null
                    ], 500);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Unsupported transaction type for update',
                'status' => $transaction->assets_transaction_status,
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the latest asset transaction running number
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLatestRunningNo()
    {
        try {
            $latestTransaction = AssetsTransaction::orderBy('assets_transaction_running_number', 'desc')->first();

            // If no transactions exist yet, return a default format
            if (!$latestTransaction) {
                $today = now()->format('Ymd'); // Current date in YYYYMMDD format
                $defaultRunningNo = "AST-{$today}-0001";

                return response()->json([
                    'success' => true,
                    'message' => 'No existing transactions, returning default running number',
                    'data' => [
                        'running_number' => $defaultRunningNo
                    ]
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Latest Running Number Retrieved',
                'data' => $latestTransaction
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve latest running number: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate the next running number based on the format AST-YYYYMMDD-XXXX
     * 
     * @return string The next running number
     */
    public function generateNextRunningNumber($transactionType)
    {
        try {
            if ($transactionType == 'ASSET OUT') {
                $latestTransaction = AssetsTransaction::where('assets_transaction_type', 'ASSET OUT')->orderBy('assets_transaction_running_number', 'desc')->first();

                if (!$latestTransaction) {
                    $nextNumber = 1;
                } else {
                    // Extract numeric part (e.g., "MKT-00123" => 123)
                    $latestNumber = (int) str_replace('INV-', '', $latestTransaction->assets_transaction_running_number);
                    $nextNumber = $latestNumber + 1;
                }

                // Format with a minimum of 5 digits, more if needed
                $numberPart = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
                $nextRunningNumber = 'INV-' . $numberPart;
            }

            if ($transactionType == 'ASSET TRANSFER') {
                $latestTransaction = AssetsTransaction::where('assets_transaction_type', 'ASSET TRANSFER')->orderBy('assets_transaction_running_number', 'desc')->first();

                if (!$latestTransaction) {
                    $nextNumber = 1;
                } else {
                    // Extract numeric part (e.g., "MKT-00123" => 123)
                    $latestNumber = (int) str_replace('MKT-', '', $latestTransaction->assets_transaction_running_number);
                    $nextNumber = $latestNumber + 1;
                }

                // Format with a minimum of 5 digits, more if needed
                $numberPart = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
                $nextRunningNumber = 'MKT-' . $numberPart;
            }

            // if ($transactionType == 'ASSET IN') {
            //     $latestTransaction = AssetsTransaction::where('assets_transaction_type', 'ASSET IN')->orderBy('assets_transaction_running_number', 'desc')->first();

            //     if (!$latestTransaction) {
            //         $nextNumber = 1;
            //     } else {
            //         // Extract numeric part (e.g., "MKT-00123" => 123)
            //         $latestNumber = (int) str_replace('MKTIN-', '', $latestTransaction->assets_transaction_running_number);
            //         $nextNumber = $latestNumber + 1;
            //     }

            //     // Format with a minimum of 5 digits, more if needed
            //     $numberPart = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            //     $nextRunningNumber = 'MKTIN-' . $numberPart;
            // }

            return $nextRunningNumber;
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate next running number: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
    public function getReport(Request $request)
    {
        // item code - asset
        // stock in date - asset transaction item list created at
        // stock out date - asset transaction item list created at
        // stock in qty - asset transaction item list asset unit sum
        // stock out qty - asset transaction item list asset unit sum
        // stock in from - asset transaction supplier id , asset from branch id
        // stock out purpose - asset transaction purpose id
        // stock in /out type - asset transaction type
        // stock current qty - asset branch values asset current unit

        if ($request->asset_branch_id) {
            $branchId = $request->asset_branch_id;

            $data = Assets::whereHas('branchValues', function ($query) use ($branchId) {
                $query->where('asset_branch_id', $branchId);
            })
                ->with([
                    'transactionItems' => function ($query) {
                        $query->select('id', 'asset_id', 'asset_transaction_id', 'created_at', 'asset_unit');
                    },
                    'transactionItems.assetsTransaction' => function ($query) {
                        $query->select('id', 'assets_transaction_type', 'assets_transaction_purpose_id', 'supplier_id', 'assets_from_branch_id', 'assets_to_branch_id');
                    },
                    // 👇 add branchId filter here
                    'branchValues' => function ($query) use ($branchId) {
                        $query->select('id', 'asset_id', 'asset_branch_id', 'asset_current_unit')
                            ->where('asset_branch_id', $branchId);
                    },
                    'transactionItems.assetsTransaction.purpose' => function ($query) {
                        $query->select('id', 'asset_transaction_purpose_name');
                    },
                ])
                ->get();
        } else {
            $data = Assets::with([
                'transactionItems' => function ($query) {
                    $query->select('id', 'asset_id', 'asset_transaction_id', 'created_at', 'asset_unit');
                },
                'transactionItems.assetsTransaction' => function ($query) {
                    $query->select('id', 'assets_transaction_type', 'assets_transaction_purpose_id', 'supplier_id', 'assets_from_branch_id', 'assets_to_branch_id');
                },
                'branchValues' => function ($query) {
                    $query->select('id', 'asset_id', 'asset_branch_id', 'asset_current_unit');
                },
                'transactionItems.assetsTransaction.purpose' => function ($query) {
                    $query->select('id', 'asset_transaction_purpose_name');
                },
            ])->get();
        }


        return response()->json([
            // 'data' => $data
            'data' => ReportResource::collection($data)
            // 'data' => new ReportResource($data)
        ], 201);
    }
}
