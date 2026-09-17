<?php

namespace App\Http\Controllers;

use App\Models\CategorieService;

class CategorieServiceController extends Controller
{
    public function index()
    {
        return response()->json(
            CategorieService::orderBy('nom')->get()
        );
    }
}
