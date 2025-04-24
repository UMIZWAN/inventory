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
            'purchase_order_id' => $this->asset_id,
            'asset_id' => $this->transaction_value,
            'status' => $this->status,
            'assets' => new AssetsResource($this->whenLoaded('assets')),
        ];
    }
}
