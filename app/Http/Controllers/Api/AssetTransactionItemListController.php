<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\AssetsTransactionItemList;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\AssetsTransaction;

class AssetTransactionItemListController extends Controller
{
    public function index()
    {
        return AssetsTransactionItemList::all();
    }

    public function show(AssetsTransactionItemList $item)
    {
        return $item;
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
                'assets_transaction_item_list.*.transaction_value' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data Gagal Disimpan!',
                    'data' => $validator->errors()
                ], 422);
            }

            // Begin transaction to ensure data integrity
            DB::beginTransaction();

            // Create the main transaction record
            $assets = AssetsTransaction::create([
                'assets_transaction_running_number' => $request->assets_transaction_running_number,
                'users_id' => $request->users_id,
                'assets_transaction_type' => $request->assets_transaction_type,
                'assets_transaction_status' => $request->assets_transaction_status,
            ]);

            // Create transaction item records
            foreach ($request->assets_transaction_item_list as $item) {
                AssetsTransactionItemList::create([
                    'asset_transaction_id' => $assets->id, // Link to parent transaction
                    'asset_id' => $item['asset_id'],
                    'transaction_value' => $item['transaction_value']
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


    public function update(Request $request, AssetsTransactionItemList $item)
    {
        $item->update($request->all());
        return $item;
    }

    public function destroy(AssetsTransactionItemList $item)
    {
        $item->delete();
        return response()->noContent();
    }
}
