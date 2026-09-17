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
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('prestataire_id')->constrained('prestataires')->cascadeOnDelete();
            $table->foreignId('categorie_service_id')->constrained('categories_services');
            $table->dateTime('date_heure');
            $table->string('adresse_intervention');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('description_besoin')->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'termine', 'annule'])->default('en_attente');
            $table->timestamps();

            $table->index(['prestataire_id', 'date_heure']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
