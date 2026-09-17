import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Prestataire } from '../core/models';
import { RendezVousService } from '../services/rendez-vous.service';
import { NotificationService } from '../core/notification.service';
import { ModalComponent } from './modal';

@Component({
  selector: 'app-reservation-modal',
  imports: [ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [ouvert]="ouvert"
      [titre]="'Prendre RDV avec ' + (prestataire?.nom_activite ?? '')"
      (fermer)="fermer.emit()"
    >
      @if (prestataire) {
        <form [formGroup]="form" (ngSubmit)="soumettre()" id="form-reservation" novalidate>
          <div class="mb-3">
            <label class="form-label">Catégorie de service</label>
            <select class="form-select" formControlName="categorie_service_id">
              @for (cat of prestataire.categories; track cat.id) {
                <option [value]="cat.id">{{ cat.nom }}</option>
              }
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" for="date_heure">Date et heure souhaitées</label>
            <input
              id="date_heure"
              type="datetime-local"
              class="form-control"
              formControlName="date_heure"
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="adresse">Adresse d'intervention</label>
            <input id="adresse" type="text" class="form-control" formControlName="adresse_intervention" />
          </div>
          <div class="mb-1">
            <label class="form-label" for="description">Décrivez votre besoin</label>
            <textarea
              id="description"
              class="form-control"
              rows="3"
              formControlName="description_besoin"
            ></textarea>
          </div>
        </form>
      }
      <div pied>
        <button type="button" class="btn btn-outline-secondary" (click)="fermer.emit()">Annuler</button>
        <button type="submit" form="form-reservation" class="btn btn-primary" [disabled]="enCours()">
          @if (enCours()) { <span class="spinner-border spinner-border-sm me-2"></span> }
          Envoyer la demande
        </button>
      </div>
    </app-modal>
  `,
})
export class ReservationModalComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private rdvService = inject(RendezVousService);
  private notif = inject(NotificationService);

  @Input() ouvert = false;
  @Input() prestataire: Prestataire | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() reserve = new EventEmitter<void>();

  readonly enCours = signal(false);

  readonly form = this.fb.nonNullable.group({
    categorie_service_id: [0, Validators.required],
    date_heure: ['', Validators.required],
    adresse_intervention: ['', Validators.required],
    description_besoin: [''],
  });

  ngOnChanges(): void {
    if (this.prestataire?.categories?.length) {
      this.form.patchValue({ categorie_service_id: this.prestataire.categories[0].id });
    }
  }

  soumettre(): void {
    if (this.form.invalid || !this.prestataire || this.enCours()) {
      this.form.markAllAsTouched();
      return;
    }
    this.enCours.set(true);
    const v = this.form.getRawValue();

    this.rdvService
      .reserver({
        prestataire_id: this.prestataire.id,
        categorie_service_id: Number(v.categorie_service_id),
        date_heure: v.date_heure,
        adresse_intervention: v.adresse_intervention,
        description_besoin: v.description_besoin || undefined,
      })
      .subscribe({
        next: () => {
          this.notif.succes('Demande de rendez-vous envoyée.');
          this.enCours.set(false);
          this.form.reset({ categorie_service_id: v.categorie_service_id });
          this.reserve.emit();
        },
        error: () => this.enCours.set(false),
      });
  }
}
