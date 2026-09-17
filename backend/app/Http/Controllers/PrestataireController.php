<?php

namespace App\Http\Controllers;

use App\Models\Prestataire;
use App\Services\RecherchePrestatairesService;
use Illuminate\Http\Request;

class PrestataireController extends Controller
{
    public function __construct(private RecherchePrestatairesService $recherche) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'categorie' => 'nullable|string|exists:categories_services,slug',
            'rayon_km' => 'nullable|numeric|min:1|max:100',
            'note_min' => 'nullable|numeric|between:0,5',
            'tri' => 'nullable|in:distance,note',
        ]);

        $resultats = $this->recherche->rechercher(
            latitude: (float) $data['latitude'],
            longitude: (float) $data['longitude'],
            categorieSlug: $data['categorie'] ?? null,
            rayonKm: isset($data['rayon_km']) ? (float) $data['rayon_km'] : null,
            noteMin: isset($data['note_min']) ? (float) $data['note_min'] : null,
            tri: $data['tri'] ?? 'distance',
        );

        return response()->json(['donnees' => $resultats]);
    }

    public function show(Prestataire $prestataire)
    {
        return response()->json(
            $prestataire->load([
                'categories',
                'user:id,name,telephone',
                'avis' => fn ($q) => $q->latest()->with('client:id,name'),
            ])
        );
    }

    public function monProfil(Request $request)
    {
        $prestataire = $request->user()->prestataire()->with('categories')->firstOrFail();

        return response()->json($prestataire);
    }

    public function mettreAJourProfil(Request $request)
    {
        $prestataire = $request->user()->prestataire()->firstOrFail();

        $data = $request->validate([
            'nom_activite' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
            'ville' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'rayon_intervention_km' => 'sometimes|integer|min:1|max:100',
            'tarif_horaire_fcfa' => 'nullable|integer|min:0',
            'disponible' => 'sometimes|boolean',
            'categories' => 'sometimes|array|min:1',
            'categories.*' => 'integer|exists:categories_services,id',
        ]);

        $prestataire->update(collect($data)->except('categories')->all());

        if (isset($data['categories'])) {
            $prestataire->categories()->sync($data['categories']);
        }

        return response()->json($prestataire->load('categories'));
    }
}
