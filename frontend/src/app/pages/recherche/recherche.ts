import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrestataireService } from '../../services/prestataire.service';
import { CategorieService } from '../../services/categorie.service';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { CategorieService as Categorie, Prestataire } from '../../core/models';
import { NoteEtoilesComponent } from '../../shared/note-etoiles';
import { ReservationModalComponent } from '../../shared/reservation-modal';
import { positionActuelle, POSITION_PAR_DEFAUT } from '../../core/geoloc';

@Component({
  selector: 'app-recherche',
  imports: [RouterLink, NoteEtoilesComponent, ReservationModalComponent],
  templateUrl: './recherche.html',
})
export class RechercheComponent implements OnInit {
  private prestataireService = inject(PrestataireService);
  private categorieService = inject(CategorieService);
  private notif = inject(NotificationService);
  auth = inject(AuthService);

  readonly resultats = signal<Prestataire[]>([]);
  readonly categories = signal<Categorie[]>([]);
  readonly chargement = signal(true);
  readonly localisationEnCours = signal(true);

  readonly position = signal(POSITION_PAR_DEFAUT);
  readonly categorie = signal<string | null>(null);
  readonly rayonKm = signal(15);
  readonly noteMin = signal<number | null>(null);
  readonly tri = signal<'distance' | 'note'>('distance');

  readonly prestataireChoisi = signal<Prestataire | null>(null);

  ngOnInit(): void {
    this.categorieService.liste().subscribe((c) => this.categories.set(c));

    positionActuelle()
      .then((pos) => this.position.set(pos))
      .catch(() =>
        this.notif.info(
          'Position par défaut utilisée (Dakar). Autorisez la géolocalisation pour de meilleurs résultats.',
        ),
      )
      .finally(() => {
        this.localisationEnCours.set(false);
        this.charger();
      });
  }

  charger(): void {
    this.chargement.set(true);
    this.prestataireService
      .rechercher({
        latitude: this.position().latitude,
        longitude: this.position().longitude,
        categorie: this.categorie() ?? undefined,
        rayon_km: this.rayonKm(),
        note_min: this.noteMin() ?? undefined,
        tri: this.tri(),
      })
      .subscribe({
        next: (r) => {
          this.resultats.set(r.donnees);
          this.chargement.set(false);
        },
        error: () => this.chargement.set(false),
      });
  }

  basculerCategorie(slug: string): void {
    this.categorie.set(this.categorie() === slug ? null : slug);
    this.charger();
  }

  changerTri(t: 'distance' | 'note'): void {
    this.tri.set(t);
    this.charger();
  }

  changerRayon(valeur: string): void {
    this.rayonKm.set(Number(valeur));
    this.charger();
  }

  ouvrirReservation(prestataire: Prestataire): void {
    if (!this.auth.estConnecte()) {
      this.notif.info('Connectez-vous pour prendre rendez-vous.');
      return;
    }
    this.prestataireChoisi.set(prestataire);
  }
}
