<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SsoController extends Controller
{
    /**
     * POST /api/sso/store-token
     *
     * Called by infonet-super to deposit a one-time SSO token.
     * Validated via Authorization: Bearer <INVENTORY_SSO_SECRET>.
     */
    public function storeToken(Request $request)
    {
        // Validate the shared secret
        $expected = 'Bearer ' . config('sso.sso_secret');
        if ($request->header('Authorization') !== $expected) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'token'      => 'required|string|size:64',
            'username'   => 'required|string',
            'expires_at' => 'required|integer',
        ]);

        // Remove any previous unused tokens for this user to keep the table clean
        DB::table('sso_tokens')
            ->where('username', $request->username)
            ->where('used', false)
            ->delete();

        DB::table('sso_tokens')->insert([
            'token'      => $request->token,
            'username'   => $request->username,
            'expires_at' => $request->expires_at,
            'used'       => false,
        ]);

        return response()->json(['message' => 'Token stored'], 200);
    }
}
