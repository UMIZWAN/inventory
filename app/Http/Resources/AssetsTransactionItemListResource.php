<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetsTransactionItemListResource extends JsonResource
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
            'assets_transaction_id' => $this->asset_transaction_id,
            'purchase_order_id' => $this->purchase_order_id,
            'asset_id' => $this->asset_id,
            'status' => $this->status,
            'assets' => new AssetsResource($this->whenLoaded('assets')),
        ];
    }
}
/*
{
            "assets_transaction_running_number": "TRX-175264",
            "purchase_order_id": null,
            "assets_transaction_type": "ASSET OUT",
            "assets_transaction_remark": "Molestiae neque possimus qui nesciunt sed amet occaecati.",
            "assets_from_branch_id": 8,
            "assets_from_branch_name": "saepe",
            "assets_to_branch_id": 9,
            "assets_to_branch_name": "sint",
            "created_by": 108,
            "created_at": "2025-04-10T06:12:28.000000Z",
            "assets_transaction_item_list": [
                {
                    "purchase_order_id": null,
                    "asset_id": 41,
                    "status": "FROZEN"
                },
                {
                    "purchase_order_id": null,
                    "asset_id": 23,
                    "status": "DISPOSED"
                },
                {
                    "purchase_order_id": null,
                    "asset_id": 19,
                    "status": "RETURNED"
                }
            ]
        } */