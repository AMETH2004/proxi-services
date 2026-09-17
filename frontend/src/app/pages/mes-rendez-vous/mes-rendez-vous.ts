import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendez-vous.service';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { RendezVous, StatutRendezVous } from '../../core/models';
import { StatutRdvBadgeComponent } from '../../shared/statut-rdv-badge';

@Component({
  selector: 'app-mes-rendez-vous',
  imports: [FormsModule, DatePipe, StatutRdvBadgeComponent],
  templateUrl: './mes-rendez-vous.html',
})
export class MesRendezVousComponent implements OnInit {
  private rdvService = inject(RendezVousService);
  private avisService = inject(AvisService);
  private notif = inject(NotificationService);
  auth = inject(AuthService);

  readonly rendezVous = signal<RendezVous[]>([]);
  readonly chargement = signal(true);

  readonly rdvEnNotation = signal<number | null>(null);
  note = 5;
  commentaire = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.rdvService.mesRendezVous().subscribe({
      next: (r) => {
        this.rendezVous.set(r);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  changerStatut(rdv: RendezVous, statut: StatutRendezVous): void {
    this.rdvService.mettreAJourStatut(rdv.id, statut).subscribe({
      next: () => {
        this.notif.succes('Rendez-vous mis à jour.');
        this.charger();
      },
    });
  }

  ouvrirNotation(rdv: RendezVous): void {
    this.rdvEnNotation.set(rdv.id);
    this.note = 5;
    this.commentaire = '';
  }

  envoyerAvis(rdv: RendezVous): void {
    this.avisService
      .laisserAvis({ rendez_vous_id: rdv.id, note: this.note, commentaire: this.commentaire || undefined })
      .subscribe({
        next: () => {
          this.notif.succes('Merci pour votre avis !');
          this.rdvEnNotation.set(null);
          this.charger();
        },
      });
  }
}
