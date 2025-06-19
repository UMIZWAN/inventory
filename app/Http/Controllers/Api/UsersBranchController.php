<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxResource;
use App\Http\Resources\UsersBranchResource;
use App\Models\Tax;
use App\Models\UsersBranch;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsersBranchController extends Controller
{
    public function index()
    {
        try {
            $usersBranch = UsersBranch::with('branch')->where('user_id', Auth::id())->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data UsersBranch',
            // 'data' => new UsersBranchResource($usersBranch)
            'data' => UsersBranchResource::collection($usersBranch)
        ], 200);
    }
}
