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
            'users_id' => $this->users_id,
            'assets_transaction_type' => $this->assets_transaction_type,
            'assets_transaction_status' => $this->assets_transaction_status,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_by' => $this->updated_by,
            'updated_at' => $this->updated_at,
            'received_by' => $this->received_by,
            'received_at' => $this->received_at,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at,
            'assets_transaction_item_list' => AssetsTransactionItemListResource::collection($this->whenLoaded('itemList')),
        ];
    }
}
