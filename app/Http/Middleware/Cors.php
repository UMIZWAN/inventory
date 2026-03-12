<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$request->isMethod('OPTIONS')) {
<<<<<<< HEAD
            // $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
            $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
=======
            $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8081');
            // $response->headers->set('Access-Control-Allow-Origin', 'https://inventory.umgroup.com.my');
>>>>>>> b7bff0947af8e0bc0f6477a22d01db502479db3e
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        } else {
            // Handle preflight OPTIONS request
            $response = response('', 200);
<<<<<<< HEAD
            // $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
            $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
=======
            $response->headers->set('Access-Control-Allow-Origin', 'http://127.0.0.1:8081');
            // $response->headers->set('Access-Control-Allow-Origin', 'https://inventory.umgroup.com.my');
>>>>>>> b7bff0947af8e0bc0f6477a22d01db502479db3e
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400'); // 24 hours
        }

        return $response;
    }
}
