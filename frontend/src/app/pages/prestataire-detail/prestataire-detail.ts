import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrestataireService } from '../../services/prestataire.service';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { Prestataire } from '../../core/models';
import { NoteEtoilesComponent } from '../../shared/note-etoiles';
import { ReservationModalComponent } from '../../shared/reservation-modal';

@Component({
  selector: 'app-prestataire-detail',
  imports: [NoteEtoilesComponent, ReservationModalComponent],
  templateUrl: './prestataire-detail.html',
})
export class PrestataireDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private prestataireService = inject(PrestataireService);
  private notif = inject(NotificationService);
  auth = inject(AuthService);

  readonly prestataire = signal<Prestataire | null>(null);
  readonly chargement = signal(true);
  readonly reservationOuverte = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.charger(id);
  }

  private charger(id: number): void {
    this.chargement.set(true);
    this.prestataireService.un(id).subscribe({
      next: (p) => {
        this.prestataire.set(p);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  ouvrirReservation(): void {
    if (!this.auth.estConnecte()) {
      this.notif.info('Connectez-vous pour prendre rendez-vous.');
      return;
    }
    this.reservationOuverte.set(true);
  }

  surReservation(): void {
    this.reservationOuverte.set(false);
  }
}
