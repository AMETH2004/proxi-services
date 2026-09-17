import { Component, Input } from '@angular/core';
import { StatutRendezVous } from '../core/models';

const COULEURS: Record<StatutRendezVous, string> = {
  en_attente: 'text-bg-warning',
  confirme: 'text-bg-primary',
  termine: 'text-bg-success',
  annule: 'text-bg-secondary',
};

const LIBELLES: Record<StatutRendezVous, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  termine: 'Terminé',
  annule: 'Annulé',
};

@Component({
  selector: 'app-statut-rdv-badge',
  template: `<span class="badge" [class]="couleur">{{ libelle }}</span>`,
})
export class StatutRdvBadgeComponent {
  @Input({ required: true }) statut!: StatutRendezVous;

  get couleur(): string {
    return COULEURS[this.statut] ?? 'text-bg-secondary';
  }

  get libelle(): string {
    return LIBELLES[this.statut] ?? this.statut;
  }
}
