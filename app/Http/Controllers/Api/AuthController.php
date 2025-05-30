<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;
        $user = $request->user()->load('accessLevel');

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => new UserResource($user)
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function profile(Request $request)
    {
        try {
            $user = $request->user()->load('accessLevel');

            return response()->json([
                'success' => true,
                'message' => 'User profile retrieved successfully',
                'data' => new UserResource($user)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'access_level_id' => 'required|integer|exists:access_level,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'access_level_id' => $request->access_level_id,
            'branch_id' => $request->branch_id,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Update an existing user
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Authorize this action (example using Gates or Policies)
        // if (! Gate::allows('update-user', $user)) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        // Validate the input
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|required|string|min:8|confirmed',
            'access_level_id' => 'sometimes|required|integer|exists:access_level,id',
            'branch_id' => 'sometimes|required|integer|exists:assets_branch,id',
        ]);

        if ($validator->fails()) {
            Log::alert($validator->errors());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update user attributes if they're present in the request
        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('branch_id')) {
            $user->branch_id = $request->branch_id;
        }

        if ($request->has('access_level_id')) {
            $user->access_level_id = $request->access_level_id;
        }

        // Save the updated user
        $user->save();

        // Load the access_level relationship
        $user->load('accessLevel');

        // Return the updated user
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function getAllUsers(Request $request)
    {
        try {
            $query = User::with('accessLevel', 'branch');

            // Filter by name
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Filter by email
            if ($request->has('email')) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }

            // Filter by access level
            if ($request->has('access_level_id')) {
                $query->where('access_level_id', $request->access_level_id);
            }

            // Filter by branch
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            // Paginate results
            $perPage = $request->input('per_page', 10);
            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'data' => UserResource::collection(Cache::remember('users_cache', 3600, function () use ($users) {
                    return $users;
                })),
                'pagination' => [
                    'total' => $users->total(),
                    'per_page' => $users->perPage(),
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem()
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
