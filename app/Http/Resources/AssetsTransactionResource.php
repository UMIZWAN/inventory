<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetsTransactionResource extends JsonResource
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
            'assets_transaction_running_number' => $this->assets_transaction_running_number,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier->supplier_name ?? null,
            'assets_recipient_name' => $this->assets_recipient_name,
            'assets_shipping_option' => $this->assets_shipping_option,
            'assets_transaction_type' => $this->assets_transaction_type,
            'assets_transaction_status' => $this->assets_transaction_status,
            'assets_shipping_option_name' => $this->shippingOption->shipping_option_name ?? null,
            'asset_transaction_purpose_name' => $this->purpose->asset_transaction_purpose_name ?? null,
            'assets_transaction_remark' => $this->assets_transaction_remark,
            'assets_from_branch_id' => $this->assets_from_branch_id,
            'assets_from_branch_name' => $this->fromBranch->name ?? null,
            'assets_to_branch_id' => $this->assets_to_branch_id,
            'assets_to_branch_name' => $this->toBranch->name ?? null,
            'assets_transaction_log' => $this->assets_transaction_log,
            'assets_transaction_total_cost' => $this->assets_transaction_total_cost,

            'created_by' => $this->created_by,
            'created_by_name' => $this->createdBy->name ?? null,
            'created_at' => $this->created_at,

            // 'updated_by' => $this->updated_by,
            // 'updated_by_name' => $this->updatedByUser->name ?? null,
            // 'updated_at' => $this->updated_at,

            'received_by' => $this->received_by,
            'received_by_name' => $this->receivedBy->name ?? null,
            'received_at' => $this->received_at,

            // 'approved_by' => $this->approved_by,
            // 'approved_by_name' => $this->approvedByUser->name ?? null,
            // 'approved_at' => $this->approved_at,

            'assets_transaction_item_list' => AssetsTransactionItemListResource::collection($this->whenLoaded('transactionItems')),
        ];
    }
}
