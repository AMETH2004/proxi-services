/** Enrobe l'API navigateur de géolocalisation dans une Promise. */
export function positionActuelle(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/** Coordonnées par défaut (centre de Dakar) si la géolocalisation est refusée/indisponible. */
export const POSITION_PAR_DEFAUT = { latitude: 14.6928, longitude: -17.4467 };
