import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser } from './models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface InscriptionPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'client' | 'prestataire';
  telephone?: string;
  nom_activite?: string;
  ville?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  rayon_intervention_km?: number;
  tarif_horaire_fcfa?: number;
  categories?: number[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  readonly user = signal<AuthUser | null>(this.lireUser());
  readonly estConnecte = computed(() => this.user() !== null);
  readonly estPrestataire = computed(() => this.user()?.role === 'prestataire');

  constructor(private http: HttpClient) {}

  register(payload: InscriptionPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((res) => this.enregistrerSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.enregistrerSession(res)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.effacerSession(),
      error: () => this.effacerSession(),
    });
  }

  rafraichir(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/user`).pipe(
      tap(({ user }) => {
        this.user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private enregistrerSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private effacerSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private lireUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
