<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role !== $role) {
            if ($request->user() && $request->user()->role === 'admin') {
                return redirect()->route('admin.school-year.index');
            }
            if ($request->user() && $request->user()->role === 'billing') {
                return redirect()->route('billing.dashboard.billingDashboard');
            }
            if ($request->user() && $request->user()->role === 'registrar') {
                return redirect()->route('registrar.enrollment.school-year-list');
            }
            return redirect()->route('home');
        }
        return $next($request);
    }
}
