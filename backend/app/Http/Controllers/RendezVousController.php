<?php

namespace App\Http\Controllers;

use App\Models\Prestataire;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RendezVousController extends Controller
{
    /**
     * Liste les RDV de l'utilisateur connecté : ses réservations s'il est
     * client, les demandes reçues s'il est prestataire.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->estPrestataire()) {
            $prestataire = $user->prestataire()->firstOrFail();
            $rendezVous = $prestataire->rendezVous()
                ->with(['client:id,name,telephone', 'categorieService'])
                ->latest('date_heure')
                ->get();
        } else {
            $rendezVous = $user->rendezVousClient()
                ->with(['prestataire.user:id,name', 'categorieService', 'avis'])
                ->latest('date_heure')
                ->get();
        }

        return response()->json($rendezVous);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'prestataire_id' => 'required|exists:prestataires,id',
            'categorie_service_id' => 'required|exists:categories_services,id',
            'date_heure' => 'required|date|after:now',
            'adresse_intervention' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description_besoin' => 'nullable|string',
        ]);

        $prestataire = Prestataire::findOrFail($data['prestataire_id']);

        if (! $prestataire->categories()->where('categories_services.id', $data['categorie_service_id'])->exists()) {
            throw ValidationException::withMessages([
                'categorie_service_id' => ["Ce prestataire ne propose pas cette catégorie de service."],
            ]);
        }

        $rendezVous = RendezVous::create([
            ...$data,
            'client_id' => $request->user()->id,
            'statut' => 'en_attente',
        ]);

        return response()->json(
            $rendezVous->load(['prestataire.user:id,name', 'categorieService']),
            201
        );
    }

    public function mettreAJourStatut(Request $request, RendezVous $rendezVous)
    {
        $user = $request->user();

        $data = $request->validate([
            'statut' => 'required|in:confirme,termine,annule',
        ]);

        $estClient = $rendezVous->client_id === $user->id;
        $estPrestataire = $user->estPrestataire() && $rendezVous->prestataire_id === $user->prestataire?->id;

        if (! $estClient && ! $estPrestataire) {
            abort(403, "Ce rendez-vous ne vous appartient pas.");
        }

        $transitionsAutorisees = [
            'confirme' => $estPrestataire && $rendezVous->statut === 'en_attente',
            'termine' => $estPrestataire && $rendezVous->statut === 'confirme',
            'annule' => in_array($rendezVous->statut, ['en_attente', 'confirme'], true),
        ];

        if (! ($transitionsAutorisees[$data['statut']] ?? false)) {
            throw ValidationException::withMessages([
                'statut' => ["Transition non autorisée depuis « {$rendezVous->statut} »."],
            ]);
        }

        $rendezVous->update(['statut' => $data['statut']]);

        return response()->json($rendezVous->fresh(['prestataire.user:id,name', 'categorieService']));
    }
}
