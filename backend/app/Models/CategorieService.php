<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CategorieService extends Model
{
    /** @use HasFactory<\Database\Factories\CategorieServiceFactory> */
    use HasFactory;

    protected $table = 'categories_services';

    protected $fillable = [
        'nom',
        'slug',
        'icone',
    ];

    public function prestataires(): BelongsToMany
    {
        return $this->belongsToMany(Prestataire::class, 'prestataire_categorie');
    }
}
