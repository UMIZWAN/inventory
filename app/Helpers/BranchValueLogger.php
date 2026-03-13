<?php

namespace App\Helpers;

use App\Models\AssetsBranch;
use App\Models\AssetsBranchValues;
use Illuminate\Support\Facades\Auth;

class BranchValueLogger
{
    /**
     * Log increment (stock received).
     *
     * @param int $assetsFromBranchId
     * @param int|null $assetsToBranchId
     * @param string $assetsTransactionType  ASSET TRANSFER | ASSET IN | ASSET OUT
     * @param array $assetsTransactionItemList  [['asset_id' => int, 'asset_unit' => int], ...]
     */
    public static function incrementLog(int $assetsFromBranchId, ?int $assetsToBranchId, string $assetsTransactionType, array $assetsTransactionItemList): void
    {
        foreach ($assetsTransactionItemList as $item) {
            $assetId = $item['asset_id'];
            $assetUnit = $item['asset_unit'];

            $branchId = match ($assetsTransactionType) {
                'ASSET TRANSFER' => $assetsToBranchId,
                'ASSET IN' => $assetsFromBranchId,
                default => $assetsFromBranchId,
            };

            $branchValue = AssetsBranchValues::where('asset_id', $assetId)
                ->where('asset_branch_id', $branchId)
                ->first();

            if (!$branchValue) {
                continue;
            }

            $message = self::buildMessage($assetsFromBranchId, $assetsToBranchId, $assetsTransactionType, $assetUnit);
            self::appendLog($branchValue, $message);
        }
    }

    /**
     * Log decrement (stock sent out / deducted).
     *
     * @param int $assetsFromBranchId
     * @param int|null $assetsToBranchId
     * @param string $assetsTransactionType  ASSET TRANSFER | ASSET IN | ASSET OUT
     * @param array $assetsTransactionItemList  [['asset_id' => int, 'asset_unit' => int], ...]
     */
    public static function decrementLog(int $assetsFromBranchId, ?int $assetsToBranchId, string $assetsTransactionType, array $assetsTransactionItemList): void
    {
        foreach ($assetsTransactionItemList as $item) {
            $assetId = $item['asset_id'];
            $assetUnit = $item['asset_unit'];

            $branchValue = AssetsBranchValues::where('asset_id', $assetId)
                ->where('asset_branch_id', $assetsFromBranchId)
                ->first();

            if (!$branchValue) {
                continue;
            }

            $message = self::buildMessage($assetsFromBranchId, $assetsToBranchId, $assetsTransactionType, $assetUnit);
            self::appendLog($branchValue, $message);
        }
    }

    /**
     * Build log message based on transaction type.
     *
     * ASSET TRANSFER: "BranchA → BranchB (5)"
     * ASSET IN:       "BranchA ↑ (5)"
     * ASSET OUT:      "BranchA ↓ (5)"
     */
    private static function buildMessage(int $assetsFromBranchId, ?int $assetsToBranchId, string $assetsTransactionType, int $assetUnit): string
    {
        $fromBranch = AssetsBranch::find($assetsFromBranchId)?->name ?? $assetsFromBranchId;

        return match ($assetsTransactionType) {
            'ASSET TRANSFER' => $fromBranch . ' → ' . (AssetsBranch::find($assetsToBranchId)?->name ?? $assetsToBranchId) . " ($assetUnit)",
            'ASSET IN' => "$fromBranch ↑ ($assetUnit)",
            'ASSET OUT' => "$fromBranch ↓ ($assetUnit)",
            'CSV IMPORT' => "CSV IMPORT $fromBranch ↑ ($assetUnit) BY " . (Auth::user()?->name ?? 'Unknown'),
            'CSV IMPORT AMEND' => "CSV IMPORT AMEND $fromBranch QUANTITY TO ($assetUnit) BY " . (Auth::user()?->name ?? 'Unknown'),
            default => "$fromBranch ($assetUnit)",
        };
    }

    /**
     * Append a log entry to branch_value_log.
     */
    private static function appendLog(AssetsBranchValues $branchValue, string $message): void
    {
        $log = $branchValue->branch_value_log ?? [];

        $log[] = [
            'message' => $message,
            'user_id' => Auth::id(),
            'timestamp' => now()->toDateTimeString(),
        ];

        $branchValue->update(['branch_value_log' => $log]);
    }
}
