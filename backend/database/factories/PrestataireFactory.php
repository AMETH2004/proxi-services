<?php

namespace Database\Factories;

use App\Models\Prestataire;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prestataire>
 */
class PrestataireFactory extends Factory
{
    /**
     * Coordonnées approximatives du centre de Dakar, avec un rayon de
     * dispersion pour simuler des prestataires dans différents quartiers.
     */
    public function definition(): array
    {
        $latitudeDakar = 14.6928;
        $longitudeDakar = -17.4467;

        return [
            'user_id' => User::factory()->prestataire(),
            'nom_activite' => fake()->company(),
            'bio' => fake()->sentence(20),
            'ville' => fake()->randomElement(['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Parcelles Assainies']),
            'adresse' => fake()->streetAddress(),
            'latitude' => $latitudeDakar + fake()->randomFloat(6, -0.09, 0.09),
            'longitude' => $longitudeDakar + fake()->randomFloat(6, -0.09, 0.09),
            'rayon_intervention_km' => fake()->randomElement([5, 10, 15, 20]),
            'tarif_horaire_fcfa' => fake()->numberBetween(2000, 15000),
            'disponible' => fake()->boolean(85),
            'note_moyenne' => 0,
            'nombre_avis' => 0,
        ];
    }
}
