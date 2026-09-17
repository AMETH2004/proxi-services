<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\CategorieService;
use App\Models\Prestataire;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = collect([
            ['nom' => 'Plomberie', 'slug' => 'plomberie', 'icone' => 'bi-droplet-fill'],
            ['nom' => 'Électricité', 'slug' => 'electricite', 'icone' => 'bi-lightning-charge-fill'],
            ['nom' => 'Coiffure', 'slug' => 'coiffure', 'icone' => 'bi-scissors'],
            ['nom' => 'Réparation électroménager', 'slug' => 'reparation-electromenager', 'icone' => 'bi-tools'],
            ['nom' => 'Ménage à domicile', 'slug' => 'menage-a-domicile', 'icone' => 'bi-bucket-fill'],
            ['nom' => 'Peinture bâtiment', 'slug' => 'peinture-batiment', 'icone' => 'bi-paint-bucket'],
            ['nom' => 'Climatisation', 'slug' => 'climatisation', 'icone' => 'bi-snow'],
            ['nom' => 'Menuiserie', 'slug' => 'menuiserie', 'icone' => 'bi-hammer'],
        ])->map(fn (array $attributs) => CategorieService::create($attributs));

        // Compte de démo côté client, utilisable directement pour tester la recherche et la prise de RDV.
        $client = User::factory()->create([
            'name' => 'Client Démo',
            'email' => 'demo@proxi-services.test',
            'role' => 'client',
        ]);

        // Une vingtaine de prestataires répartis sur les catégories, avec 1 à 2 spécialités chacun.
        $prestataires = Prestataire::factory(20)->create();

        $prestataires->each(function (Prestataire $prestataire) use ($categories) {
            $prestataire->categories()->attach(
                $categories->random(random_int(1, 2))->pluck('id')
            );
        });

        // Quelques rendez-vous terminés + avis pour peupler les notes, plus quelques RDV en attente/confirmés.
        $prestataires->each(function (Prestataire $prestataire) use ($client) {
            $nombreAvis = random_int(0, 5);

            for ($i = 0; $i < $nombreAvis; $i++) {
                $rdv = RendezVous::factory()->termine()->create([
                    'client_id' => $client->id,
                    'prestataire_id' => $prestataire->id,
                    'categorie_service_id' => $prestataire->categories()->inRandomOrder()->first()->id,
                ]);

                Avis::factory()->create([
                    'rendez_vous_id' => $rdv->id,
                    'client_id' => $client->id,
                    'prestataire_id' => $prestataire->id,
                ]);
            }

            RendezVous::factory()->create([
                'client_id' => $client->id,
                'prestataire_id' => $prestataire->id,
                'categorie_service_id' => $prestataire->categories()->inRandomOrder()->first()->id,
                'statut' => fake()->randomElement(['en_attente', 'confirme']),
                'date_heure' => fake()->dateTimeBetween('now', '+2 weeks'),
            ]);

            $prestataire->update([
                'nombre_avis' => $prestataire->avis()->count(),
                'note_moyenne' => round((float) $prestataire->avis()->avg('note'), 2),
            ]);
        });
    }
}
