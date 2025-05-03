<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessLevelResource extends JsonResource
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
            'add_edit_role' => (bool) $this->add_edit_role,
            'view_role' => (bool) $this->view_role,
            'add_edit_user' => (bool) $this->add_edit_user,
            'view_user' => (bool) $this->view_user,
            'add_edit_asset' => (bool) $this->add_edit_asset,
            'view_asset' => (bool) $this->view_asset,
            'view_asset_masterlist' => (bool) $this->view_asset_masterlist,
            'add_edit_branch' => (bool) $this->add_edit_branch,
            'view_branch' => (bool) $this->view_branch,
            'add_edit_transaction' => (bool) $this->add_edit_transaction,
            'view_transaction' => (bool) $this->view_transaction,
            'approve_reject_transaction' => (bool) $this->approve_reject_transaction,
            'receive_transaction' => (bool) $this->receive_transaction,
            'add_edit_purchase_order' => (bool) $this->add_edit_purchase_order,
            'view_purchase_order' => (bool) $this->view_purchase_order,
            'add_edit_supplier' => (bool) $this->add_edit_supplier,
            'view_supplier' => (bool) $this->view_supplier,
            'add_edit_tax' => (bool) $this->add_edit_tax,
            'view_tax' => (bool) $this->view_tax,
            'view_reports' => (bool) $this->view_reports,
            'download_reports' => (bool) $this->download_reports,
        ];
    }
}
