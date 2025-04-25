<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier->supplier_name,
            'expected_receipt_date' => $this->expected_receipt_date,
            'tax_id' => $this->tax_id,
            'tax_name' => $this->tax->tax_name,
            'billing_address' => $this->billing_address,
            'shipping_address' => $this->shipping_address,
            'tracking_ref' => $this->tracking_ref,
            'purchase_order_notes' => $this->purchase_order_notes,
            'purchase_internal_notes' => $this->purchase_internal_notes,
            'purchase_order_running_number' => $this->purchase_order_running_number,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'received_by' => $this->received_by,
            'approved_by' => $this->approved_by,
            'purchase_order_item_list' => $this->whenLoaded('items', function () {
                return AssetsTransactionItemListResource::collection($this->items);
            }),
        ];
    }
}
