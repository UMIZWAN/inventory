<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\AssetsTransaction;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\AssetsTransactionItemList;
use App\Http\Resources\AssetsTransactionResource;


class AssetsTransactionController extends Controller
{
    public function index()
    {
        try {
            $transactions = AssetsTransaction::with([
                'fromBranch',
                'toBranch',
                'itemList',
                'createdByUser',
                'updatedByUser',
                'approvedByUser',
                'receivedByUser'
            ])->paginate(10);

            return response()->json([
                'success' => true,
                'message' => 'Data retrieved successfully',
                'data' => AssetsTransactionResource::collection($transactions)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kesalahan Terjadi',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function show(AssetsTransaction $assetTransaction)
    {
        return "hai";
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'assets_transaction_running_number' => 'required|string',
                'users_id' => 'required|exists:users,id', // Changed from user_id to match your JSON
                'assets_transaction_type' => 'required|string',
                'assets_transaction_status' => 'required|string',
                'assets_transaction_item_list' => 'required|array',
                'assets_transaction_item_list.*.asset_id' => 'required|exists:assets,id',
                'assets_transaction_item_list.*.asset_unit' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Gagal Disimpan!',
                    'data' => $validator->errors()
                ], 422);
            }

            $itemListData = $request->assets_transaction_item_list;

            // Begin transaction to ensure data integrity
            DB::beginTransaction();

            // Create the main transaction record
            $assets = AssetsTransaction::create([
                'assets_transaction_running_number' => $request->assets_transaction_running_number,
                'users_id' => $request->users_id,
                'assets_transaction_type' => $request->assets_transaction_type,
                'assets_transaction_status' => $request->assets_transaction_status,
            ]);


            // // Create transaction item records
            foreach ($itemListData as $item) {
                DB::table('assets_transaction_item_list')->insert([
                    'asset_transaction_id' => $assets->id,
                    'asset_id' => $item['asset_id'],
                    'asset_unit' => $item['asset_unit']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data Berhasil Disimpan!',
                'data' => $assets->load('itemList') // Assuming you have a relationship method
            ], 201);
        } catch (Exception $e) {
            DB::rollBack(); // Roll back any changes if an error occurs

            return response()->json([
                'success' => false,
                'message' => 'Kesalahan Terjadi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, AssetsTransaction $assetTransaction)
    {
        $assetTransaction->update($request->all());
        return $assetTransaction;
    }

    public function destroy(AssetsTransaction $assetTransaction)
    {
        $assetTransaction->delete();
        return response()->noContent();
    }
}
