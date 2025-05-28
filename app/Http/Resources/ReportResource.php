<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'asset_category_id' => $this->asset_category_id,
            'asset_running_number' => $this->asset_running_number,
            'branch_values' => $this->branchValues
                ->when(request('branch_id'), function ($collection, $branchId) {
                    return $collection->filter(fn($branch) => $branch->asset_branch_id == $branchId);
                })
                ->map(function ($branch) {
                    // Filter and map 'ASSET IN' transactions (from any source to this branch)
                    $assetInTransactions = $this->transactionItems
                        ->filter(function ($item) use ($branch) {
                            $trx = $item->assetsTransaction;
                            // An ASSET IN transaction's assets_from_branch_id is effectively its origin (supplier or branch)
                            // This seems to imply direct branch entry or transfer in.
                            // Assuming ASSET IN is always into the current branch, but checking from_branch_id to be safe.
                            return ($trx->assets_from_branch_id === $branch->asset_branch_id || $trx->assets_to_branch_id === $branch->asset_branch_id) &&
                                $trx->assets_transaction_type === 'ASSET IN';
                        })
                        ->map(function ($item) {
                            $trx = $item->assetsTransaction;
                            return [
                                'asset_transaction_type' => $trx->assets_transaction_type,
                                'created_at' => $item->created_at,
                                'supplier_id' => $trx->supplier_id,
                                'supplier_name' => $trx->supplier->supplier_name ?? null,
                                // 'assets_from_branch_id' => $trx->assets_from_branch_id,
                                // 'assets_from_branch_name' => $trx->fromBranch->name ?? null,
                                'asset_unit' => $item->asset_unit,
                            ];
                        }); // No ->values() here yet, we'll concat first

                    // Filter and map 'ASSET TRANSFER' transactions *to* this branch
                    $assetTransferInTransactions = $this->transactionItems
                        ->filter(function ($item) use ($branch) {
                            $trx = $item->assetsTransaction;
                            return $trx->assets_to_branch_id === $branch->asset_branch_id &&
                                $trx->assets_transaction_type === 'ASSET TRANSFER';
                        })
                        ->map(function ($item) {
                            $trx = $item->assetsTransaction;
                            return [
                                'asset_transaction_type' => $trx->assets_transaction_type,
                                'created_at' => $item->created_at,
                                'supplier_id' => $trx->supplier_id,
                                'assets_from_branch_id' => $trx->assets_from_branch_id ?? $trx->supplier_id,
                                'assets_from_branch_name' => $trx->fromBranch->name ?? null,
                                'assets_to_branch_id' => $trx->assets_to_branch_id,
                                'asset_unit' => $item->asset_unit,
                            ];
                        }); // No ->values() here yet, we'll concat first

                    // Combine all "asset in" related transactions
                    $combinedAssetIn = $assetInTransactions->concat($assetTransferInTransactions)->values();


                    // Filter and map 'ASSET OUT' transactions (from this branch)
                    $assetOutTransactions = $this->transactionItems
                        ->filter(function ($item) use ($branch) {
                            $trx = $item->assetsTransaction;
                            return $trx->assets_from_branch_id === $branch->asset_branch_id &&
                                $trx->assets_transaction_type === 'ASSET OUT';
                        })
                        ->map(function ($item) {
                            $trx = $item->assetsTransaction;
                            return [
                                'asset_transaction_type' => $trx->assets_transaction_type,
                                'created_at' => $item->created_at,
                                'asset_transaction_purpose_name' => $trx->purpose->asset_transaction_purpose_name ?? null,
                                'assets_from_branch_id' => $trx->assets_from_branch_id,
                                'asset_unit' => $item->asset_unit,
                            ];
                        }); // No ->values() here yet, we'll concat first

                    // Filter and map 'ASSET TRANSFER' transactions *from* this branch
                    $assetTransferOutTransactions = $this->transactionItems
                        ->filter(function ($item) use ($branch) {
                            $trx = $item->assetsTransaction;
                            return $trx->assets_from_branch_id === $branch->asset_branch_id &&
                                $trx->assets_transaction_type === 'ASSET TRANSFER';
                        })
                        ->map(function ($item) {
                            $trx = $item->assetsTransaction;
                            return [
                                'asset_transaction_type' => $trx->assets_transaction_type,
                                'created_at' => $item->created_at,
                                'supplier_id' => $trx->supplier_id,
                                'assets_from_branch_id' => $trx->assets_from_branch_id ?? $trx->supplier_id,
                                'assets_to_branch_id' => $trx->assets_to_branch_id,
                                'asset_unit' => $item->asset_unit,
                            ];
                        }); // No ->values() here yet, we'll concat first

                    // Combine all "asset out" related transactions
                    $combinedAssetOut = $assetOutTransactions->concat($assetTransferOutTransactions)->values();

                    return [
                        'branch_id' => $branch->asset_branch_id,
                        'asset_current_unit' => $branch->asset_current_unit,
                        'asset_in' => $combinedAssetIn->isNotEmpty() ? $combinedAssetIn : null,
                        'asset_out' => $combinedAssetOut->isNotEmpty() ? $combinedAssetOut : null,
                    ];
                })->values(),
        ];
    }
}
