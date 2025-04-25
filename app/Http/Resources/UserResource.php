<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'branch_id' => $this->branch_id,
            'branch_name' => $this->branch->name,
            'access_level_id' => $this->access_level_id,
            'access_level_name' => $this->accessLevel->name,
            'add_edit_role' => $this->accessLevel->add_edit_role,
            'view_role' => $this->accessLevel->view_role,
            'add_edit_user' => $this->accessLevel->add_edit_user,
            'view_user' => $this->accessLevel->view_user,
            'add_edit_asset' => $this->accessLevel->add_edit_asset,
            'view_asset' => $this->accessLevel->view_asset,
            'add_edit_branch' => $this->accessLevel->add_edit_branch,
            'view_branch' => $this->accessLevel->view_branch,
            'add_edit_transaction' => $this->accessLevel->add_edit_transaction,
            'view_transaction' => $this->accessLevel->view_transaction,
            'approve_reject_transaction' => $this->accessLevel->approve_reject_transaction,
            'receive_transaction' => $this->accessLevel->receive_transaction,
            'add_edit_purchase_order' => $this->accessLevel->add_edit_purchase_order,
            'view_purchase_order' => $this->accessLevel->view_purchase_order,
            'add_edit_supplier' => $this->accessLevel->add_edit_supplier,
            'view_supplier' => $this->accessLevel->view_supplier,
            'add_edit_tax' => $this->accessLevel->add_edit_tax,
            'view_tax' => $this->accessLevel->view_tax,
            'view_reports' => $this->accessLevel->view_reports,
            'download_reports' => $this->accessLevel->download_reports,
        ];
    }
}
