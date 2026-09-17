<?php

namespace Database\Factories;

use App\Models\Avis;
use App\Models\Prestataire;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Avis>
 */
class AvisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rendez_vous_id' => RendezVous::factory()->termine(),
            'client_id' => User::factory(),
            'prestataire_id' => Prestataire::factory(),
            'note' => fake()->numberBetween(3, 5),
            'commentaire' => fake()->sentence(12),
        ];
    }
}
