import { IonContent, IonPage, IonList, IonLabel, IonButton, useIonToast, IonIcon, useIonViewWillEnter, IonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { API_ENDPOINTS } from '../config/api';
import { cachedFetch } from '../utils/apiCache';
import { 
  requestNotificationPermissions, 
  checkNotificationPermissions, 
  scheduleMatchNotifications, 
  cancelMatchNotifications 
} from '../lib/notifications';
import './Home.css';

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

interface DisplayedMatch extends Match {
  homeTeam: FetchedTeam;
  awayTeam: FetchedTeam;
}

const SAVED_MATCHES_KEY = 'savedMatches';
const DEFAULT_APP_ICON = '/favicon.png';

const Home: React.FC = () => {
  const [matches, setMatches] = useState<DisplayedMatch[]>([]);
  const [savedMatchIds, setSavedMatchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const teamsResponse = await cachedFetch(API_ENDPOINTS.TEAMS);
        if (!teamsResponse.ok) throw new Error('Error al cargar los equipos');
        const teamsResult = await teamsResponse.json();
        const teamsMap = new Map<number, FetchedTeam>();
        teamsResult.data.forEach((team: FetchedTeam) => teamsMap.set(team.id, team));

        const matchesResponse = await cachedFetch(API_ENDPOINTS.MATCHES);
        if (!matchesResponse.ok) throw new Error('Error al cargar los partidos');
        const matchesResult = await matchesResponse.json();
        const fetchedMatches: Match[] = matchesResult.data;

        const augmentedMatches: DisplayedMatch[] = fetchedMatches
        .filter(match => match.status !== 'finished')
        .map(match => ({
          ...match,
          homeTeam: teamsMap.get(match.homeTeamId) || { id: match.homeTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
          awayTeam: teamsMap.get(match.awayTeamId) || { id: match.awayTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
        }));

        setMatches(augmentedMatches);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
        present({ message: errorMessage, duration: 3000, color: 'danger' });
      } finally {
        setLoading(false);
      }

      const saved = localStorage.getItem(SAVED_MATCHES_KEY);
      if (saved) setSavedMatchIds(JSON.parse(saved));
    };

    loadData();
  }, [present]);

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) setSavedMatchIds(JSON.parse(saved));
  });

  const handleToggleSaveMatch = async (match: DisplayedMatch) => {
    const isMatchSaved = savedMatchIds.includes(match.id);

    if (isMatchSaved) {
      // Unsave the match and cancel notifications
      const newSavedMatchIds = savedMatchIds.filter(id => id !== match.id);
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);
      await cancelMatchNotifications(match.id);
      present({ message: 'Partido desguardado y notificaciones canceladas.', duration: 2000, color: 'medium' });
    } else {
      // Save the match first
      const newSavedMatchIds = [...savedMatchIds, match.id];
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);

      // Handle notifications
      try {
        let permission = await checkNotificationPermissions();
        
        if (permission === 'prompt') {
          const granted = await requestNotificationPermissions();
          permission = granted ? 'granted' : 'denied';
        }

        if (permission === 'granted') {
          const scheduled = await scheduleMatchNotifications({
            id: match.id,
            matchDate: match.matchDate,
            homeTeamName: match.homeTeam.name,
            awayTeamName: match.awayTeam.name,
          });
          if (scheduled) {
            present({ message: 'Partido guardado. Se te notificará antes y al empezar.', duration: 3000, color: 'success' });
          } else {
            present({ message: 'Partido guardado. El partido ya ha comenzado.', duration: 3000, color: 'medium' });
          }
        } else {
          present({
            message: 'Partido guardado, pero las notificaciones están bloqueadas. Habilítalas en los ajustes de tu navegador.',
            duration: 5000,
            color: 'warning'
          });
        }
      } catch (error) {
        console.error("Error handling notifications:", error);
        present({
          message: 'Ocurrió un error al configurar las notificaciones.',
          duration: 4000,
          color: 'danger'
        });
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonText><h3>Cargando partidos...</h3><p>Por favor espera un momento</p></IonText>
          </div>
        ) : matches.length > 0 ? (
          <IonList>
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <h3 className="ion-text-center">
                    {new Date(match.matchDate).toLocaleDateString('es-ES', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </h3>
                </div>
                <div className="match-content">
                  <div className="teams-container">
                    <div className="team">
                      <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} />
                      <IonLabel>{match.homeTeam.name}</IonLabel>
                    </div>
                    <div className="vs-label">VS</div>
                    <div className="team">
                      <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} />
                      <IonLabel>{match.awayTeam.name}</IonLabel>
                    </div>
                  </div>
                  <div className="ion-text-right">
                    <IonButton
                      fill="clear"
                      className={`favorite-button ${savedMatchIds.includes(match.id) ? 'favorited' : ''}`}
                      onClick={() => handleToggleSaveMatch(match)}
                    >
                      <IonIcon
                        slot="icon-only"
                        icon={savedMatchIds.includes(match.id) ? bookmark : bookmarkOutline}
                      />
                    </IonButton>
                  </div>
                </div>
              </div>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText><h3>No hay partidos disponibles</h3><p>Los partidos se cargarán automáticamente cuando estén disponibles</p></IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;