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
        Schema::create('prestataire_categorie', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestataire_id')->constrained('prestataires')->cascadeOnDelete();
            $table->foreignId('categorie_service_id')->constrained('categories_services')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['prestataire_id', 'categorie_service_id'], 'prestataire_categorie_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestataire_categorie');
    }
};
