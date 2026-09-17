<?php

namespace App\Http\Controllers;

use App\Models\CategorieService;
use App\Models\Prestataire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'nullable|string|max:30',
            'role' => 'required|in:client,prestataire',

            // Requis uniquement si role = prestataire
            'nom_activite' => 'required_if:role,prestataire|string|max:255',
            'ville' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'latitude' => 'required_if:role,prestataire|numeric|between:-90,90',
            'longitude' => 'required_if:role,prestataire|numeric|between:-180,180',
            'rayon_intervention_km' => 'nullable|integer|min:1|max:100',
            'tarif_horaire_fcfa' => 'nullable|integer|min:0',
            'categories' => 'required_if:role,prestataire|array|min:1',
            'categories.*' => 'integer|exists:categories_services,id',
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'telephone' => $data['telephone'] ?? null,
                'role' => $data['role'],
            ]);

            if ($data['role'] === 'prestataire') {
                $prestataire = Prestataire::create([
                    'user_id' => $user->id,
                    'nom_activite' => $data['nom_activite'],
                    'ville' => $data['ville'] ?? null,
                    'adresse' => $data['adresse'] ?? null,
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'rayon_intervention_km' => $data['rayon_intervention_km'] ?? 10,
                    'tarif_horaire_fcfa' => $data['tarif_horaire_fcfa'] ?? null,
                ]);

                $prestataire->categories()->attach($data['categories']);
            }

            return $user;
        });

        $token = $user->createToken('proxi-services-spa')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé.',
            'user' => $user->load('prestataire.categories'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $token = $user->createToken('proxi-services-spa')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user->load('prestataire.categories'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->load('prestataire.categories')]);
    }
}
