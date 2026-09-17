import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RendezVous, StatutRendezVous } from '../core/models';

export interface NouveauRendezVous {
  prestataire_id: number;
  categorie_service_id: number;
  date_heure: string;
  adresse_intervention: string;
  latitude?: number;
  longitude?: number;
  description_besoin?: string;
}

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/rendez-vous`;

  mesRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.url);
  }

  reserver(data: NouveauRendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.url, data);
  }

  mettreAJourStatut(id: number, statut: StatutRendezVous): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.url}/${id}/statut`, { statut });
  }
}
