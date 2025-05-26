<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Eager load required relationships if not already loaded
        $this->loadMissing([
            'transactionItems.assetsTransaction',
            'branchValues.branch',
        ]);

        // Grouped transactions by relevant branch
        $branchTransactions = $this->getBranchTransactions();

        return [
            'name' => $this->name,
            'running_no' => $this->asset_running_number,
            'branches' => $this->branchValues->map(function ($branchValue) use ($branchTransactions) {
                $branchId = $branchValue->asset_branch_id;
                $branch = $branchValue->branch;

                return [
                    'asset_branch_id' => $branchId,
                    'branch_name' => $branch->name ?? null,
                    'in' =>  $this->getAssetIn($branchId),
                    'out' => $this->getAssetOut($branchId),
                    'current_stock' => $branchValue->asset_current_unit ?? 0,
                ];
            })->values(),

            'total_in' => $this->getTotalIn(),
            'total_out' => $this->getTotalOut(),
            'net_movement' => $this->getNetMovement(),
        ];
    }

    /**
     * Group transaction items by branch involved.
     */
    protected function getBranchTransactions()
    {
        return $this->transactionItems
            ->flatMap(function ($item) {
                $transaction = $item->assetsTransaction;
                $type = $transaction->assets_transaction_type;

                $base = [
                    'transaction_id' => $transaction->id,
                    'type' => $type,
                    'units' => $item->asset_unit,
                    'date' => $transaction->created_at,
                ];

                if ($type === 'ASSET TRANSFER') {
                    // One entry for OUT (from branch), one for IN (to branch)
                    return collect([
                        [$transaction->assets_from_branch_id => array_merge($base, ['type' => 'ASSET OUT'])],
                        [$transaction->assets_to_branch_id => array_merge($base, ['type' => 'ASSET IN'])],
                    ]);
                }

                $branchId = $type === 'ASSET IN'
                    ? $transaction->assets_to_branch_id
                    : $transaction->assets_from_branch_id;

                return [[$branchId => $base]];
            })
            ->groupBy(fn($entry) => array_key_first($entry))
            ->map(fn($items) => collect($items)->map(fn($entry) => array_values($entry)[0]));
    }


    protected function getAssetIn($branchId)
    {
        return $this->transactionItems
            ->filter(function ($item) use ($branchId) {
                $transaction = $item->assetsTransaction;
                return (
                    ($transaction->assets_transaction_type === 'ASSET IN' &&
                        $transaction->assets_from_branch_id == $branchId) ||

                    ($transaction->assets_transaction_type === 'ASSET TRANSFER' &&
                        $transaction->assets_to_branch_id == $branchId)
                );
            })
            ->sum('asset_unit');
    }

    protected function getAssetOut($branchId)
    {
        return $this->transactionItems
            ->filter(function ($item) use ($branchId) {
                $transaction = $item->assetsTransaction;
                return (
                    ($transaction->assets_transaction_type === 'ASSET OUT' &&
                        $transaction->assets_from_branch_id == $branchId) ||

                    ($transaction->assets_transaction_type === 'ASSET TRANSFER' &&
                        $transaction->assets_from_branch_id == $branchId)
                );
            })
            ->sum('asset_unit');
    }

    /**
     * Net movement = Total In - Total Out.
     */
    protected function getNetMovement()
    {
        return $this->getTotalIn() - $this->getTotalOut();
    }

    /**
     * Get total incoming units.
     * Includes ASSET IN and incoming ASSET TRANSFER.
     */
    protected function getTotalIn()
    {
        return $this->transactionItems
            ->filter(function ($item) {
                $transaction = $item->assetsTransaction;
                return in_array($transaction->assets_transaction_type, ['ASSET IN', 'ASSET TRANSFER']);
            })
            ->sum('asset_unit');
    }

    /**
     * Get total outgoing units.
     * Includes ASSET OUT and outgoing ASSET TRANSFER.
     */
    protected function getTotalOut()
    {
        return $this->transactionItems
            ->filter(function ($item) {
                $transaction = $item->assetsTransaction;
                return in_array($transaction->assets_transaction_type, ['ASSET OUT', 'ASSET TRANSFER']);
            })
            ->sum('asset_unit');
    }
}
