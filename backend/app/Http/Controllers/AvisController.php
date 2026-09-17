<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AvisController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'rendez_vous_id' => 'required|exists:rendez_vous,id',
            'note' => 'required|integer|between:1,5',
            'commentaire' => 'nullable|string|max:2000',
        ]);

        $rendezVous = RendezVous::with('avis')->findOrFail($data['rendez_vous_id']);

        if ($rendezVous->client_id !== $request->user()->id) {
            abort(403, "Ce rendez-vous ne vous appartient pas.");
        }

        if ($rendezVous->statut !== 'termine') {
            throw ValidationException::withMessages([
                'rendez_vous_id' => ["Seul un rendez-vous terminé peut être noté."],
            ]);
        }

        if ($rendezVous->avis) {
            throw ValidationException::withMessages([
                'rendez_vous_id' => ["Ce rendez-vous a déjà été noté."],
            ]);
        }

        $avis = Avis::create([
            'rendez_vous_id' => $rendezVous->id,
            'client_id' => $request->user()->id,
            'prestataire_id' => $rendezVous->prestataire_id,
            'note' => $data['note'],
            'commentaire' => $data['commentaire'] ?? null,
        ]);

        $prestataire = $rendezVous->prestataire;
        $prestataire->update([
            'nombre_avis' => $prestataire->avis()->count(),
            'note_moyenne' => round((float) $prestataire->avis()->avg('note'), 2),
        ]);

        return response()->json($avis, 201);
    }
}
