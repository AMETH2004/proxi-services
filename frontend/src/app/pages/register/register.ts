import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { CategorieService } from '../../services/categorie.service';
import { CategorieService as Categorie } from '../../core/models';
import { positionActuelle, POSITION_PAR_DEFAUT } from '../../core/geoloc';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notif = inject(NotificationService);
  private categorieService = inject(CategorieService);

  readonly enCours = signal(false);
  readonly localisationEnCours = signal(false);
  readonly categories = signal<Categorie[]>([]);

  readonly form = this.fb.nonNullable.group({
    role: ['client' as 'client' | 'prestataire', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', Validators.required],
    // Champs prestataire
    nom_activite: [''],
    ville: [''],
    adresse: [''],
    latitude: [POSITION_PAR_DEFAUT.latitude],
    longitude: [POSITION_PAR_DEFAUT.longitude],
    rayon_intervention_km: [10],
    tarif_horaire_fcfa: [null as number | null],
    categories: [[] as number[]],
  });

  ngOnInit(): void {
    this.categorieService.liste().subscribe((c) => this.categories.set(c));
  }

  get estPrestataire(): boolean {
    return this.form.controls.role.value === 'prestataire';
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
        this.notif.succes('Position détectée.');
      })
      .catch(() => this.notif.erreur("Impossible de récupérer votre position. Vous pouvez la laisser par défaut."))
      .finally(() => this.localisationEnCours.set(false));
  }

  soumettre(): void {
    if (this.form.invalid || this.enCours()) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.controls.password.value !== this.form.controls.password_confirmation.value) {
      this.notif.erreur('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.estPrestataire && this.form.controls.categories.value.length === 0) {
      this.notif.erreur('Choisissez au moins une catégorie de service.');
      return;
    }

    this.enCours.set(true);
    const v = this.form.getRawValue();

    this.auth
      .register({
        name: v.name,
        email: v.email,
        password: v.password,
        password_confirmation: v.password_confirmation,
        role: v.role,
        telephone: v.telephone || undefined,
        ...(this.estPrestataire
          ? {
              nom_activite: v.nom_activite,
              ville: v.ville || undefined,
              adresse: v.adresse || undefined,
              latitude: v.latitude,
              longitude: v.longitude,
              rayon_intervention_km: v.rayon_intervention_km,
              tarif_horaire_fcfa: v.tarif_horaire_fcfa ?? undefined,
              categories: v.categories,
            }
          : {}),
      })
      .subscribe({
        next: () => {
          this.notif.succes('Compte créé, bienvenue sur ProxiServices.');
          this.router.navigateByUrl('/recherche');
        },
        error: () => this.enCours.set(false),
      });
  }
}
