 import { IonContent, IonPage, IonList , IonLabel, IonText, IonButton, useIonToast, IonIcon, useIonViewWillEnter } from '@ionic/react';
import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { bookmark } from 'ionicons/icons';
import { API_ENDPOINTS } from '../config/api';
import { cachedFetch } from '../utils/apiCache';
import './Favorites.css';

// Interfaces for type safety
interface Match {
  id: number;
  created_at: string;
  updated_at: string;
  weekNumber: number;
  scoreHome: number;
  scoreAway: number;
  status: string;
  matchDate: string;
  homeTeamId: number;
  awayTeamId: number;
}

interface FetchedTeam {
  id: number;
  name: string;
  logoUrl: string;
}

// New interface for matches with resolved team details
interface DisplayedMatch extends Match {
  homeTeam: FetchedTeam;
  awayTeam: FetchedTeam;
}

const SAVED_MATCHES_KEY = 'savedMatches';
const DEFAULT_APP_ICON = '/favicon.png'; // Path to your default app icon

const Favorites: React.FC = () => {
  const [favoriteMatches, setFavoriteMatches] = useState<DisplayedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();

  const loadFavoriteMatches = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(SAVED_MATCHES_KEY);
      const savedIds = saved ? JSON.parse(saved) : [];

      if (savedIds.length === 0) {
        setFavoriteMatches([]);
        setLoading(false);
        return;
      }

      // Fetch all teams and create a lookup map
      const teamsResponse = await cachedFetch(API_ENDPOINTS.TEAMS);
      if (!teamsResponse.ok) throw new Error('Error al cargar los equipos');
      const teamsResult = await teamsResponse.json();
      const teamsMap = new Map<number, FetchedTeam>();
      teamsResult.data.forEach((team: FetchedTeam) => teamsMap.set(team.id, team));

      // Fetch all matches
      const matchesResponse = await cachedFetch(API_ENDPOINTS.MATCHES);
      if (!matchesResponse.ok) throw new Error('Error al cargar los partidos');
      const matchesResult = await matchesResponse.json();
      const allMatches: Match[] = matchesResult.data;

      // Filter for saved matches and augment with team data
      const favoriteAugmentedMatches = allMatches
        .filter(match => savedIds.includes(match.id))
        .map(match => ({
          ...match,
          homeTeam: teamsMap.get(match.homeTeamId) || { id: match.homeTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
          awayTeam: teamsMap.get(match.awayTeamId) || { id: match.awayTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
        }));

      setFavoriteMatches(favoriteAugmentedMatches);

    } catch (error) {
      console.error("Error loading favorite matches:", error);
      const message = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
      present({ message, duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    loadFavoriteMatches();
  });

  const handleUnsaveMatch = async (matchId: number) => {
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    const savedIds = saved ? JSON.parse(saved) : [];
    const newSavedMatchIds = savedIds.filter((id: number) => id !== matchId);
    localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));

    // Update the state to remove the match from the view
    setFavoriteMatches(prevMatches => prevMatches.filter(match => match.id !== matchId));

    await LocalNotifications.cancel({ notifications: [{ id: matchId }] });
    present({ message: 'Partido desguardado.', duration: 2000, color: 'medium' });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 className="ion-text-center">Partidos Guardados</h2>
          <p className="ion-text-center">Aquí puedes ver los partidos que has marcado como favoritos.</p>
        </IonText>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonText>
              <h3>Cargando favoritos...</h3>
            </IonText>
          </div>
        ) : favoriteMatches.length > 0 ? (
          <IonList>
            {favoriteMatches.map(match => (
              <div key={match.id} className="match-card" style={{margin: '15px 0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', background: 'var(--ion-background-color, white)'}}>
                <div className="match-header">
                  <h3 className="ion-text-center">
                    {new Date(match.matchDate).toLocaleDateString('es-ES', { // Use matchDate
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                </div>
                <div className="match-content">
                  <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1'}}>
                      <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--ion-color-light)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '8px'}} />
                      <IonLabel style={{fontSize: '0.9em'}}>{match.homeTeam.name}</IonLabel>
                    </div>
                    <div style={{fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)', background: 'var(--ion-color-light)', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
                      VS
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1'}}>
                      <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--ion-color-light)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '8px'}} />
                      <IonLabel style={{fontSize: '0.9em'}}>{match.awayTeam.name}</IonLabel>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <IonButton
                      fill="clear"
                      className="favorite-button favorited"
                      onClick={() => handleUnsaveMatch(match.id)}
                    >
                      <IonIcon
                        slot="icon-only"
                        icon={bookmark}
                      />
                    </IonButton>
                  </div>
                </div>
              </div>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText>
              <p>Aún no tienes partidos favoritos. ¡Explora y añade algunos!</p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
