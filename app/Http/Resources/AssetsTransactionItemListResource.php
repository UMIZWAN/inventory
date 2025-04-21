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
            'asset_id' => $this->asset_id,
            'transaction_value' => $this->transaction_value,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'asset_name' => $this->asset->name,
            'asset_running_number' => $this->asset->asset_running_number,
            'asset_tag_name' => $this->asset->tag->name,
            'asset_category_name' => $this->asset->category->name,
            'asset_branch_name' => $this->asset->branch->name,
            'asset_current_value' => $this->asset->asset_current_value,
            'asset_image' => $this->asset->image,
            // Add asset details if needed
            // 'asset' => new AssetsResource($this->whenLoaded('asset')),
        ];
    }
}
