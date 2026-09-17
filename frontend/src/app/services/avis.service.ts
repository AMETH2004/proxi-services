import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Avis } from '../core/models';

export interface NouvelAvis {
  rendez_vous_id: number;
  note: number;
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/avis`;

  laisserAvis(data: NouvelAvis): Observable<Avis> {
    return this.http.post<Avis>(this.url, data);
  }
}
