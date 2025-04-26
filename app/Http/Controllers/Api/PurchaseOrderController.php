<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\AssetsTransactionItemList;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        try {
            $purchaseOrder = PurchaseOrder::with('purchaseItem')->paginate(20);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Purchase Order',
            'data' => $purchaseOrder
        ], 200);
    }

    public function show($id)
    {
        try {
            $purchaseOrder = PurchaseOrder::with('purchaseItem')->find($id);
            if (!$purchaseOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase Order not found',
                    'data' => null
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Purchase Order',
            'data' => $purchaseOrder
        ], 200);
    }
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'supplier_id' => 'required|integer|exists:suppliers,id',
                'expected_receipt_date' => 'required|date',
                'tax_id' => 'required|integer|exists:tax,id',
                'billing_address' => 'required|string|max:255',
                'shipping_address' => 'required|string|max:255',
                'tracking_ref' => 'required|string|max:255|unique:purchase_order,tracking_ref',
                'purchase_order_notes' => 'nullable|string|max:255',
                'purchase_internal_notes' => 'nullable|string|max:255',
                'purchase_order_running_number' => 'nullable|string|unique:purchase_order,purchase_order_running_number',
                'purchase_item' => 'required|array|min:1',
                'purchase_item.*.asset_id' => 'required|integer|exists:assets,id',
                'purchase_item.*.asset_unit' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $purchaseOrderData = $request->only([
                'supplier_id',
                'expected_receipt_date',
                'tax_id',
                'billing_address',
                'shipping_address',
                'tracking_ref',
                'purchase_order_notes',
                'purchase_internal_notes',
                'purchase_order_running_number'
            ]);

            $purchaseOrder = PurchaseOrder::create($purchaseOrderData);

            foreach ($request->purchase_item as $item) {
                AssetsTransactionItemList::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'asset_id' => $item['asset_id'],
                    'asset_unit' => $item['asset_unit'],
                    'status' => 'ON HOLD'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase Order created successfully',
                'data' => $purchaseOrder->load('purchaseItem')
            ], 201);
        } catch (\Exception $e) {
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
                'supplier_id' => 'required|integer|exists:suppliers,id',
                'expected_receipt_date' => 'required|date',
                'tax_id' => 'required|integer|exists:tax,id',
                'billing_address' => 'required|string|max:255',
                'shipping_address' => 'required|string|max:255',
                'tracking_ref' => "required|string|max:255|unique:purchase_order,tracking_ref,{$id}",
                'purchase_order_notes' => 'nullable|string|max:255',
                'purchase_internal_notes' => 'nullable|string|max:255',
                'purchase_order_running_number' => "nullable|string|unique:purchase_order,purchase_order_running_number,{$id}",
                'purchase_item' => 'required|array|min:1',
                'purchase_item.*.asset_id' => 'required|integer|exists:assets,id',
                'purchase_item.*.asset_unit' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $purchaseOrder = PurchaseOrder::findOrFail($id);

            DB::beginTransaction();

            $purchaseOrder->update($request->only([
                'supplier_id',
                'expected_receipt_date',
                'tax_id',
                'billing_address',
                'shipping_address',
                'tracking_ref',
                'purchase_order_notes',
                'purchase_internal_notes',
                'purchase_order_running_number'
            ]));

            $submittedItems = collect($request->purchase_item);
            $existingItems = $purchaseOrder->purchaseItem()->get()->keyBy('asset_id');

            $submittedAssetIds = [];

            foreach ($submittedItems as $item) {
                $submittedAssetIds[] = $item['asset_id'];

                if ($existingItems->has($item['asset_id'])) {
                    // Update existing item
                    $existingItems[$item['asset_id']]->update([
                        'asset_unit' => $item['asset_unit']
                    ]);
                } else {
                    // Create new item
                    AssetsTransactionItemList::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'asset_id' => $item['asset_id'],
                        'asset_unit' => $item['asset_unit'],
                        'status' => 'ON HOLD'
                    ]);
                }
            }

            // Remove items not in the submitted list
            $purchaseOrder->purchaseItem()
                ->whereNotIn('asset_id', $submittedAssetIds)
                ->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase Order updated successfully',
                'data' => $purchaseOrder->load('purchaseItem')
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $purchaseOrder = PurchaseOrder::find($id);
            if (!$purchaseOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase Order not found',
                    'data' => null
                ], 404);
            }
            $purchaseOrder->delete();
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order deleted successfully',
                'data' => null
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}

/*
{
        "supplier_id": 52,
        "expected_receipt_date": "2025-06-27T00:00:00.000000Z",
        "tax_id": 38,
        "billing_address": "123 Wilhelmine Cliffs\nWest Veronastad, HI 53980",
        "shipping_address": "858 Bruen Walks\nEast Jonatan, DC 48357",
        "tracking_ref": "JX95583667",
        "purchase_order_notes": "Voluptatibus quo minus ratione consequatur. Quam nisi ipsum repudiandae mollitia quaerat est.",
        "purchase_internal_notes": "Qui consequuntur ad vel ut ut assumenda. Et tempore exercitationem vel non sed eum. Sed est laudantium mollitia aut nesciunt perferendis cum. Vel qui exercitationem assumenda sint.",
        "purchase_order_running_number": "PO-857650",
        "purchase_item": [
            {
                "purchase_order_id": 32,
                "asset_id": 42,
                "asset_unit": 6,
            },
            {
                "purchase_order_id": 32,
                "asset_id": 18,
                "asset_unit": 5,
            }
        ]
    }
 */