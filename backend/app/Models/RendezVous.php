<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RendezVous extends Model
{
    /** @use HasFactory<\Database\Factories\RendezVousFactory> */
    use HasFactory;

    protected $table = 'rendez_vous';

    protected $fillable = [
        'client_id',
        'prestataire_id',
        'categorie_service_id',
        'date_heure',
        'adresse_intervention',
        'latitude',
        'longitude',
        'description_besoin',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_heure' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(Prestataire::class);
    }

    public function categorieService(): BelongsTo
    {
        return $this->belongsTo(CategorieService::class);
    }

    public function avis(): HasOne
    {
        return $this->hasOne(Avis::class);
    }
}
