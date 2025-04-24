<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SuppliersResource extends JsonResource
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
            'supplier_name' => $this->name,
            'supplier_office_number' => $this->supplier_office_number,
            'supplier_email' => $this->supplier_email,
            'supplier_address' => $this->supplier_address
        ];
    }
}
