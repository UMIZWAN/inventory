<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetsResource extends JsonResource
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
            'name' => $this->name,
            'asset_running_number' => $this->asset_running_number,
            'asset_description' => $this->asset_description,
            'asset_type' => $this->asset_type,
            'asset_category_id' => $this->asset_category_id,
            'asset_category_name' => $this->category->name,
            'asset_tag_id' => $this->asset_tag_id,
            'asset_tag_name' => $this->tag->name,
            'asset_stable_unit' => $this->asset_stable_unit,
            'asset_purchase_cost' => $this->asset_purchase_cost,
            'asset_sales_cost' => $this->asset_sales_cost,
            'asset_unit_measure' => $this->asset_unit_measure,
            'asset_image' => $this->asset_image,
            'assets_remark' => $this->assets_remark,
            'assets_log' => $this->assets_log,
            'branch_values' => $this->whenLoaded('branchValues', function () {
                return AssetsBranchValuesResource::collection($this->branchValues);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
