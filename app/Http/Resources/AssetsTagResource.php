<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetsTagResource extends JsonResource
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
            'branch_id' => $this->asset_branch_id,
            'branch_name' => $this->branch->name ?? null,
            'location_id' => $this->asset_location_id,
            'location_name' => $this->location->name ?? null,
            'asset_current_unit' => $this->asset_current_unit
        ];
    }
}
