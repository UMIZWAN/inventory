<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxResource;
use App\Models\Tax;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxController extends Controller
{
    public function index()
    {
        try {
            $tax = Tax::get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'List Data Assets Tag',
            'data' => $tax
        ], 200);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tax_name' => 'required|string|max:255',
                'tax_percentage' => 'required|numeric|min:0|max:100',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            $tax = Tax::create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Tax created successfully',
                'data' => $tax
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $tax = Tax::find($id);
            if (!$tax) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tax not found',
                    'data' => null
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Tax',
            'data' => $tax
        ], 200);
    }

    public function update(Request $request, $id)
    {
        try {
            $tax = Tax::find($id);
            if (!$tax) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tax not found',
                    'data' => null
                ], 404);
            }
            $validator = Validator::make($request->all(), [
                'tax_name' => 'required|string|max:255',
                'tax_percentage' => 'required|numeric|min:0|max:100',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            $tax->update($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Tax updated successfully',
                'data' => $tax
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $tax = Tax::find($id);
            if (!$tax) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tax not found',
                    'data' => null
                ], 404);
            }
            $tax->delete();
            return response()->json([
                'success' => true,
                'message' => 'Tax deleted successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
