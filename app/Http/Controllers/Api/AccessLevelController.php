<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class AccessLevelController extends Controller
{
    /**
     * Display a listing of the access levels.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $accessLevels = AccessLevel::latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'List of Access Levels',
                'data' => $accessLevels
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created access level in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:access_level',
            'add_edit_role' => 'boolean',
            'view_role' => 'boolean',
            'add_edit_user' => 'boolean',
            'view_user' => 'boolean',
            'add_edit_asset' => 'boolean',
            'view_asset' => 'boolean',
            'view_asset_masterlist' => 'boolean',
            'add_edit_branch' => 'boolean',
            'view_branch' => 'boolean',
            'add_edit_transaction' => 'boolean',
            'view_transaction' => 'boolean',
            'approve_reject_transaction' => 'boolean',
            'receive_transaction' => 'boolean',
            'add_edit_purchase_order' => 'boolean',
            'view_purchase_order' => 'boolean',
            'add_edit_supplier' => 'boolean',
            'view_supplier' => 'boolean',
            'add_edit_tax' => 'boolean',
            'view_tax' => 'boolean',
            'view_reports' => 'boolean',
            'download_reports' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $accessLevel = AccessLevel::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Access Level Created Successfully',
                'data' => $accessLevel
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified access level.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $accessLevel = AccessLevel::find($id);

            if (!$accessLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Level Not Found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Access Level Details',
                'data' => $accessLevel
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified access level in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:access_level,name,' . $id,
            'add_edit_role' => 'boolean',
            'view_role' => 'boolean',
            'add_edit_user' => 'boolean',
            'view_user' => 'boolean',
            'add_edit_asset' => 'boolean',
            'view_asset' => 'boolean',
            'view_asset_masterlist' => 'boolean',
            'add_edit_branch' => 'boolean',
            'view_branch' => 'boolean',
            'add_edit_transaction' => 'boolean',
            'view_transaction' => 'boolean',
            'approve_reject_transaction' => 'boolean',
            'receive_transaction' => 'boolean',
            'add_edit_purchase_order' => 'boolean',
            'view_purchase_order' => 'boolean',
            'add_edit_supplier' => 'boolean',
            'view_supplier' => 'boolean',
            'add_edit_tax' => 'boolean',
            'view_tax' => 'boolean',
            'view_reports' => 'boolean',
            'download_reports' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $accessLevel = AccessLevel::find($id);

            if (!$accessLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Level Not Found'
                ], 404);
            }

            $accessLevel->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Access Level Updated Successfully',
                'data' => $accessLevel
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified access level from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $accessLevel = AccessLevel::find($id);

            if (!$accessLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Level Not Found'
                ], 404);
            }

            // Check if there are users associated with this access level
            if ($accessLevel->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete this access level because it is assigned to users'
                ], 409); // Conflict status code
            }

            $accessLevel->delete();

            return response()->json([
                'success' => true,
                'message' => 'Access Level Deleted Successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get access level with associated users.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWithUsers($id)
    {
        try {
            $accessLevel = AccessLevel::with('users')->find($id);

            if (!$accessLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Level Not Found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Access Level with Users',
                'data' => $accessLevel
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
