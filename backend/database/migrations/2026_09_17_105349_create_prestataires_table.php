<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prestataires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nom_activite');
            $table->text('bio')->nullable();
            $table->string('ville')->nullable();
            $table->string('adresse')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->unsignedSmallInteger('rayon_intervention_km')->default(10);
            $table->unsignedInteger('tarif_horaire_fcfa')->nullable();
            $table->boolean('disponible')->default(true);
            $table->decimal('note_moyenne', 3, 2)->default(0);
            $table->unsignedInteger('nombre_avis')->default(0);
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestataires');
    }
};
