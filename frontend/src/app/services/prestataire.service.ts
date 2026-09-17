import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Prestataire, ResultatRecherchePrestataires } from '../core/models';
import { toParams } from '../core/api';

export interface FiltresPrestataires {
  latitude: number;
  longitude: number;
  categorie?: string;
  rayon_km?: number;
  note_min?: number;
  tri?: 'distance' | 'note';
}

export interface MiseAJourProfilPrestataire {
  nom_activite?: string;
  bio?: string;
  ville?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  rayon_intervention_km?: number;
  tarif_horaire_fcfa?: number;
  disponible?: boolean;
  categories?: number[];
}

@Injectable({ providedIn: 'root' })
export class PrestataireService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/prestataires`;

  rechercher(filtres: FiltresPrestataires): Observable<ResultatRecherchePrestataires> {
    return this.http.get<ResultatRecherchePrestataires>(this.url, { params: toParams(filtres) });
  }

  un(id: number): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.url}/${id}`);
  }

  monProfil(): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${environment.apiUrl}/mon-profil-prestataire`);
  }

  mettreAJourProfil(data: MiseAJourProfilPrestataire): Observable<Prestataire> {
    return this.http.put<Prestataire>(`${environment.apiUrl}/mon-profil-prestataire`, data);
  }
}
