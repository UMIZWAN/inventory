<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetsBranchValuesResource extends JsonResource
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
            'asset_id' => $this->asset_id,
            'asset_branch_id' => $this->asset_branch_id,
            'asset_branch_name' => $this->branch->name,
            // 'asset_location_id' => $this->asset_location_id,
            // 'asset_location_name' => $this->location->name,
            'asset_current_unit' => $this->asset_current_unit,
        ];
    }
}
