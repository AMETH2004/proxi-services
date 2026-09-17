# ProxiServices — marketplace de services de proximité

Trouve un plombier, un coiffeur ou un réparateur près de chez toi. Recherche
géolocalisée par catégorie, profils prestataires avec avis notés, prise de
rendez-vous en ligne et matching par distance/disponibilité/note.

- **backend/** — API REST Laravel 12 + Sanctum (SQLite)
- **frontend/** — SPA Angular 22 (standalone, Bootstrap 5)

## Fonctionnalités démontrées

- **Géolocalisation** : position du client (navigateur) comparée à celle des
  prestataires via une distance Haversine (`RecherchePrestatairesService`),
  avec filtrage par rayon d'intervention et tri par proximité.
- **Matching** : recherche combinant catégorie de service, distance et note
  minimum, triable par « plus proches » ou « mieux notés ».
- **Système de notation** : avis (1 à 5) laissés uniquement après un
  rendez-vous marqué « terminé », un seul avis par rendez-vous ; la note
  moyenne du prestataire est recalculée à chaque nouvel avis.
- **Prise de RDV** : cycle de statut complet
  `en_attente → confirmé → terminé` (ou `annulé`), avec des transitions
  restreintes selon le rôle (le prestataire confirme/termine, le client peut
  annuler tant que ce n'est pas terminé).

## Prérequis

PHP 8.3+, Composer, Node 20+.

## Démarrage

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env          # SQLite par défaut, rien à configurer
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed     # crée les tables + catégories + prestataires + un compte client démo
php artisan serve              # http://127.0.0.1:8000
```

Compte créé par le seeder : `demo@proxi-services.test` / `password`
(rôle client). Chaque prestataire généré par la factory utilise aussi le mot
de passe `password`.

### 2. Frontend

```bash
cd frontend
npm install
npm start                      # http://localhost:4200 (ou le port choisi par ng serve)
```

## Modèle de données

- `users` (`role` : client / prestataire / admin)
- `categories_services` (Plomberie, Électricité, Coiffure, Ménage…)
- `prestataires` — profil métier lié à un `user`, position (lat/lng), rayon
  d'intervention, tarif horaire, note moyenne mise en cache
- `prestataire_categorie` — relation many-to-many (un prestataire peut
  proposer plusieurs catégories)
- `rendez_vous` — réservation client ↔ prestataire pour une catégorie
  donnée, avec statut
- `avis` — un par rendez-vous terminé, alimente la note moyenne du
  prestataire

## Architecture de la recherche géolocalisée

SQLite (utilisé en dev) n'exposant pas de fonctions trigonométriques en SQL,
`RecherchePrestatairesService` pré-filtre les prestataires par une boîte
englobante (arithmétique simple, portable sur tout moteur) autour du point de
recherche, puis calcule la distance exacte (Haversine) en PHP sur ce
sous-ensemble avant de filtrer par rayon et de trier par distance ou note.
