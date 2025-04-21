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
            'asset_type' => $this->asset_type,
            'asset_category_id' => $this->asset_category_id,
            'asset_category_name' => $this->category->name, // Assuming 'category' relationship exists
            'asset_tag_id' => $this->asset_tag_id,
            'asset_tag_name' => $this->tag->name, // Assuming 'tag' relationship exists
            'asset_stable_value' => $this->asset_stable_value,
            'asset_current_value' => $this->asset_current_value,
            'asset_purchase_cost' => $this->asset_purchase_cost, // Assuming this field exists
            'asset_sales_cost' => $this->asset_sales_cost, // Assuming this field exists
            'asset_unit_measure' => $this->asset_unit_measure, // Assuming this field exists
            'assets_branch_id' => $this->assets_branch_id,
            'assets_branch_name' => $this->branch->name, // Assuming 'branch' relationship exists
            'assets_location_id' => $this->assets_location_id, // Updated for foreign key
            'assets_location_name' => $this->location->name, // Using branch name as location name
            'asset_image' => $this->asset_image,
            'assets_remark' => json_decode($this->assets_remark, true), // Decode the JSON for remarks
            'assets_log' => json_decode($this->assets_log, true), // Decode the JSON for logs
        ];
    }
}
