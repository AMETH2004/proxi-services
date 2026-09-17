<?php

namespace Database\Factories;

use App\Models\CategorieService;
use App\Models\Prestataire;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RendezVous>
 */
class RendezVousFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'prestataire_id' => Prestataire::factory(),
            'categorie_service_id' => CategorieService::factory(),
            'date_heure' => fake()->dateTimeBetween('-1 month', '+2 weeks'),
            'adresse_intervention' => fake()->streetAddress(),
            'latitude' => null,
            'longitude' => null,
            'description_besoin' => fake()->sentence(15),
            'statut' => fake()->randomElement(['en_attente', 'confirme', 'termine', 'annule']),
        ];
    }

    public function termine(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'termine',
            'date_heure' => fake()->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }
}
