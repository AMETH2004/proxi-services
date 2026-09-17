import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorieService as Categorie } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categories`;

  liste(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.url);
  }
}
