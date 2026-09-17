<?php

namespace Database\Factories;

use App\Models\CategorieService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CategorieService>
 */
class CategorieServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nom = fake()->unique()->randomElement([
            'Plomberie', 'Électricité', 'Coiffure', 'Réparation électroménager',
            'Ménage à domicile', 'Peinture bâtiment', 'Climatisation', 'Menuiserie',
        ]);

        return [
            'nom' => $nom,
            'slug' => Str::slug($nom),
            'icone' => 'bi-tools',
        ];
    }
}
