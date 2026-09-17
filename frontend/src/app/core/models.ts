/** Types partagés avec l'API Laravel (proxi-services backend). */

export type Role = 'client' | 'prestataire' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  telephone?: string | null;
  prestataire?: Prestataire | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface CategorieService {
  id: number;
  nom: string;
  slug: string;
  icone: string;
}

export interface Prestataire {
  id: number;
  user_id: number;
  nom_activite: string;
  bio?: string | null;
  ville?: string | null;
  adresse?: string | null;
  latitude: number;
  longitude: number;
  rayon_intervention_km: number;
  tarif_horaire_fcfa?: number | null;
  disponible: boolean;
  note_moyenne: number;
  nombre_avis: number;
  distance_km?: number;
  categories?: CategorieService[];
  user?: { id: number; name: string; telephone?: string | null };
  avis?: Avis[];
}

export type StatutRendezVous = 'en_attente' | 'confirme' | 'termine' | 'annule';

export interface RendezVous {
  id: number;
  client_id: number;
  prestataire_id: number;
  categorie_service_id: number;
  date_heure: string;
  adresse_intervention: string;
  latitude?: number | null;
  longitude?: number | null;
  description_besoin?: string | null;
  statut: StatutRendezVous;
  prestataire?: Prestataire;
  categorie_service?: CategorieService;
  client?: { id: number; name: string; telephone?: string | null };
  avis?: Avis | null;
}

export interface Avis {
  id: number;
  rendez_vous_id: number;
  client_id: number;
  prestataire_id: number;
  note: number;
  commentaire?: string | null;
  created_at: string;
  client?: { id: number; name: string };
}

export interface ResultatRecherchePrestataires {
  donnees: Prestataire[];
}
