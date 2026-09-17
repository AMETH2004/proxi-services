<?php

namespace App\Services;

use App\Models\Prestataire;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Matching géolocalisé : SQLite (utilisé en dev/démo) n'expose pas les
 * fonctions trigonométriques nécessaires à un calcul de distance Haversine
 * en SQL. On pré-filtre donc par une boîte englobante (arithmétique simple,
 * portable sur tout moteur), puis on calcule la distance exacte en PHP sur
 * ce sous-ensemble avant de trier/filtrer par rayon.
 */
class RecherchePrestatairesService
{
    private const RAYON_TERRE_KM = 6371;

    /**
     * @return Collection<int, Prestataire>
     */
    public function rechercher(
        float $latitude,
        float $longitude,
        ?string $categorieSlug = null,
        ?float $rayonKm = null,
        ?float $noteMin = null,
        string $tri = 'distance',
    ): Collection {
        $rayonRecherche = $rayonKm ?? 15.0;
        $deltaLat = $rayonRecherche / 111.0;
        $deltaLng = $rayonRecherche / (111.0 * max(cos(deg2rad($latitude)), 0.1));

        $requete = Prestataire::query()
            ->with(['categories', 'user'])
            ->where('disponible', true)
            ->whereBetween('latitude', [$latitude - $deltaLat, $latitude + $deltaLat])
            ->whereBetween('longitude', [$longitude - $deltaLng, $longitude + $deltaLng]);

        if ($categorieSlug) {
            $requete->whereHas('categories', fn (Builder $q) => $q->where('slug', $categorieSlug));
        }

        if ($noteMin !== null) {
            $requete->where('note_moyenne', '>=', $noteMin);
        }

        $resultats = $requete->get()
            ->map(function (Prestataire $prestataire) use ($latitude, $longitude) {
                $prestataire->distance_km = round($this->distanceHaversine(
                    $latitude,
                    $longitude,
                    $prestataire->latitude,
                    $prestataire->longitude,
                ), 2);

                return $prestataire;
            })
            ->filter(fn (Prestataire $prestataire) => $prestataire->distance_km <= $rayonRecherche);

        return $tri === 'note'
            ? $resultats->sortByDesc('note_moyenne')->values()
            : $resultats->sortBy('distance_km')->values();
    }

    private function distanceHaversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLng = deg2rad($lng2 - $lng1);

        $a = sin($deltaLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($deltaLng / 2) ** 2;

        return self::RAYON_TERRE_KM * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
