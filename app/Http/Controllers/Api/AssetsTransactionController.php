<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetsTransactionResource;
use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AssetsBranchValues;

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
            ])->paginate($request->per_page ?? 10);

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
            if ($request->assets_transaction_type == 'ASSET OUT') {

                $validator = Validator::make($request->all(), [
                    'assets_transaction_running_number' => 'required|string|unique:assets_transaction,assets_transaction_running_number',
                    'assets_transaction_type' => 'required|string',
                    'assets_from_branch_id' => 'required|integer',
                    'created_by' => 'required|integer|exists:users,id',
                    'created_at' => 'nullable|date',
                    'assets_transaction_item_list' => 'required|array|min:1',
                    'assets_transaction_item_list.*.asset_id' => 'required|integer|exists:assets,id',
                    'assets_transaction_item_list.*.status' => 'required|string|in:ON HOLD,DELIVERED,FROZEN,RECEIVED,RETURNED,DISPOSED',
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

                $transaction = AssetsTransaction::create($request->only([
                    'assets_transaction_running_number',
                    'assets_transaction_type',
                    'assets_transaction_remark',
                    'assets_from_branch_id',
                    'created_by',
                    'created_at'
                ]));

                foreach ($request->assets_transaction_item_list as $item) {
                    AssetsTransactionItemList::create([
                        'asset_transaction_id' => $transaction->id,
                        'asset_id' => $item['asset_id'],
                        'status' => $item['status'],
                        'asset_unit' => $item['asset_unit']
                    ]);
                }

                // deduct asset current unit from assetbranchvalue

                // update asset branch value
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
                    'data' => $transaction->load('transactionItems')
                ], 201);
            }

            if ($request->assets_transaction_type == 'ASSET IN') {
                $validator = Validator::make($request->all(), [
                    'assets_transaction_running_number' => 'required|string|unique:assets_transaction,assets_transaction_running_number',
                    'purchase_order_id' => 'nullable|integer|exists:purchase_order,id',
                    'assets_transaction_type' => 'required|string',
                    'assets_from_branch_id' => 'required|integer',
                    'created_by' => 'required|integer|exists:users,id',
                    'created_at' => 'nullable|date',
                    'assets_transaction_item_list' => 'required|array|min:1',
                    'assets_transaction_item_list.*.asset_id' => 'required|integer|exists:assets,id',
                    'assets_transaction_item_list.*.status' => 'required|string|in:ON HOLD,DELIVERED,FROZEN,RECEIVED,RETURNED,DISPOSED',
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

                $transaction = AssetsTransaction::create($request->only([
                    'assets_transaction_running_number',
                    'assets_transaction_type',
                    'assets_transaction_remark',
                    'assets_from_branch_id',
                    'created_by',
                    'created_at'
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

                // add asset current unit from assetbranchvalue where branch id = $request [frombranchid] and asset id = $item[assetid]

                // update asset branch value
                foreach ($request->assets_transaction_item_list as $item) {
                    $assetBranchValue = AssetsBranchValues::where('asset_branch_id', $request->assets_from_branch_id)
                        ->where('asset_id', $item['asset_id'])
                        ->first();

                    if ($assetBranchValue) {
                        $assetBranchValue->increment('asset_current_unit', $item['asset_unit']);
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
                    'assets_transaction_status' => 'required|string|in:DRAFT,IN-TRANSFER,RECEIVED',
                    'assets_from_branch_id' => 'required|integer',
                    'assets_to_branch_id' => 'required|integer',
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
                    'assets_transaction_status' => $request->assets_transaction_status,
                    'assets_transaction_remark' => $request->assets_transaction_remark,
                    'assets_from_branch_id' => $request->assets_from_branch_id,
                    'assets_to_branch_id' => $request->assets_to_branch_id,
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
                }
            
                // only do quantity update based on transaction status
                if ($request->assets_transaction_status == 'IN-TRANSFER') {
                    // Deduct from source branch
                    foreach ($request->assets_transaction_item_list as $item) {
                        $assetBranchFromValue = AssetsBranchValues::where('asset_branch_id', $request->assets_from_branch_id)
                            ->where('asset_id', $item['asset_id'])
                            ->first();
            
                        if ($assetBranchFromValue) {
                            $assetBranchFromValue->decrement('asset_current_unit', $item['asset_unit']);
                        }
                    }
                }
            
                if ($request->assets_transaction_status == 'RECEIVED') {
                    // Add to destination branch
                    foreach ($request->assets_transaction_item_list as $item) {
                        $assetBranchToValue = AssetsBranchValues::where('asset_branch_id', $request->assets_to_branch_id)
                            ->where('asset_id', $item['asset_id'])
                            ->first();
            
                        if ($assetBranchToValue) {
                            $assetBranchToValue->increment('asset_current_unit', $item['asset_unit']);
                        }
                    }
                }
            
                // DRAFT -> do nothing to quantities
            
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
}
