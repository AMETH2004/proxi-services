import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrestataireService } from '../../services/prestataire.service';
import { CategorieService } from '../../services/categorie.service';
import { NotificationService } from '../../core/notification.service';
import { CategorieService as Categorie } from '../../core/models';
import { positionActuelle } from '../../core/geoloc';

@Component({
  selector: 'app-mon-profil',
  imports: [ReactiveFormsModule],
  templateUrl: './mon-profil.html',
})
export class MonProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private prestataireService = inject(PrestataireService);
  private categorieService = inject(CategorieService);
  private notif = inject(NotificationService);

  readonly chargement = signal(true);
  readonly enregistrementEnCours = signal(false);
  readonly localisationEnCours = signal(false);
  readonly categories = signal<Categorie[]>([]);

  readonly form = this.fb.nonNullable.group({
    nom_activite: ['', Validators.required],
    bio: [''],
    ville: [''],
    adresse: [''],
    latitude: [0],
    longitude: [0],
    rayon_intervention_km: [10, [Validators.required, Validators.min(1)]],
    tarif_horaire_fcfa: [null as number | null],
    disponible: [true],
    categories: [[] as number[]],
  });

  ngOnInit(): void {
    this.categorieService.liste().subscribe((c) => this.categories.set(c));

    this.prestataireService.monProfil().subscribe({
      next: (p) => {
        this.form.patchValue({
          nom_activite: p.nom_activite,
          bio: p.bio ?? '',
          ville: p.ville ?? '',
          adresse: p.adresse ?? '',
          latitude: p.latitude,
          longitude: p.longitude,
          rayon_intervention_km: p.rayon_intervention_km,
          tarif_horaire_fcfa: p.tarif_horaire_fcfa ?? null,
          disponible: p.disponible,
          categories: p.categories?.map((c) => c.id) ?? [],
        });
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  basculerCategorie(id: number): void {
    const actuel = this.form.controls.categories.value;
    this.form.controls.categories.setValue(
      actuel.includes(id) ? actuel.filter((c) => c !== id) : [...actuel, id],
    );
  }

  categorieCochee(id: number): boolean {
    return this.form.controls.categories.value.includes(id);
  }

  utiliserMaPosition(): void {
    this.localisationEnCours.set(true);
    positionActuelle()
      .then(({ latitude, longitude }) => {
        this.form.patchValue({ latitude, longitude });
        this.notif.succes('Position mise à jour.');
      })
      .catch(() => this.notif.erreur('Impossible de récupérer votre position.'))
      .finally(() => this.localisationEnCours.set(false));
  }

  enregistrer(): void {
    if (this.form.invalid || this.enregistrementEnCours()) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.controls.categories.value.length === 0) {
      this.notif.erreur('Choisissez au moins une catégorie de service.');
      return;
    }

    this.enregistrementEnCours.set(true);
    const v = this.form.getRawValue();

    this.prestataireService
      .mettreAJourProfil({
        ...v,
        tarif_horaire_fcfa: v.tarif_horaire_fcfa ?? undefined,
      })
      .subscribe({
        next: () => {
          this.notif.succes('Profil mis à jour.');
          this.enregistrementEnCours.set(false);
        },
        error: () => this.enregistrementEnCours.set(false),
      });
  }
}
