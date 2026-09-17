<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prestataire extends Model
{
    /** @use HasFactory<\Database\Factories\PrestataireFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom_activite',
        'bio',
        'ville',
        'adresse',
        'latitude',
        'longitude',
        'rayon_intervention_km',
        'tarif_horaire_fcfa',
        'disponible',
        'note_moyenne',
        'nombre_avis',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'disponible' => 'boolean',
            'note_moyenne' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(CategorieService::class, 'prestataire_categorie');
    }

    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class);
    }

    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class);
    }
}
