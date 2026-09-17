<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\CategorieServiceController;
use App\Http\Controllers\PrestataireController;
use App\Http\Controllers\RendezVousController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API ProxiServices — marketplace de services de proximité
|--------------------------------------------------------------------------
| Recherche de prestataires et catégories publiques. Prise de RDV, avis
| et gestion de profil prestataire nécessitent un compte (Sanctum).
*/

// --- Public ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategorieServiceController::class, 'index']);
Route::get('/prestataires', [PrestataireController::class, 'index']);
Route::get('/prestataires/{prestataire}', [PrestataireController::class, 'show']);

// --- Authentifié ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/mon-profil-prestataire', [PrestataireController::class, 'monProfil']);
    Route::put('/mon-profil-prestataire', [PrestataireController::class, 'mettreAJourProfil']);

    Route::get('/rendez-vous', [RendezVousController::class, 'index']);
    Route::post('/rendez-vous', [RendezVousController::class, 'store']);
    Route::patch('/rendez-vous/{rendezVous}/statut', [RendezVousController::class, 'mettreAJourStatut']);

    Route::post('/avis', [AvisController::class, 'store']);
});
