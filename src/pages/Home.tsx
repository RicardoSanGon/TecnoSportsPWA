import { IonContent, IonPage, IonList, IonLabel, IonButton, useIonToast, IonIcon, useIonViewWillEnter, IonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { bookmark, bookmarkOutline } from 'ionicons/icons'; // Importar iconos de bookmark
import { API_ENDPOINTS } from '../config/api';
import { cachedFetch } from '../utils/apiCache';
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

// New interface for matches with resolved team details
interface DisplayedMatch extends Match {
  homeTeam: FetchedTeam;
  awayTeam: FetchedTeam;
}

const SAVED_MATCHES_KEY = 'savedMatches';
const DEFAULT_APP_ICON = '/favicon.png'; // Path to your default app icon

const Home: React.FC = () => {
  const [matches, setMatches] = useState<DisplayedMatch[]>([]); // Use DisplayedMatch
  const [savedMatchIds, setSavedMatchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch all teams and create a lookup map
        const teamsResponse = await cachedFetch(API_ENDPOINTS.TEAMS);
        if (!teamsResponse.ok) {
          throw new Error('Error al cargar los equipos');
        }
        const teamsResult = await teamsResponse.json();
        const teams: FetchedTeam[] = teamsResult.data;
        const teamsMap = new Map<number, FetchedTeam>();
        teams.forEach(team => teamsMap.set(team.id, team));

        // Fetch matches
        const matchesResponse = await cachedFetch(API_ENDPOINTS.MATCHES);
        if (!matchesResponse.ok) {
          throw new Error('Error al cargar los partidos');
        }
        const matchesResult = await matchesResponse.json();
        const fetchedMatches: Match[] = matchesResult.data;

        // Combine matches with team data
        const augmentedMatches: DisplayedMatch[] = fetchedMatches.map(match => ({
          ...match,
          homeTeam: teamsMap.get(match.homeTeamId) || { id: match.homeTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
          awayTeam: teamsMap.get(match.awayTeamId) || { id: match.awayTeamId, name: 'Unknown Team', logoUrl: DEFAULT_APP_ICON },
        }));

        setMatches(augmentedMatches);
        console.log('Matches loaded:', augmentedMatches);

      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
        present({ message: errorMessage, duration: 3000, color: 'danger' });
      } finally {
        setLoading(false);
      }

      // Load saved matches from local storage
      const saved = localStorage.getItem(SAVED_MATCHES_KEY);
      if (saved) {
        setSavedMatchIds(JSON.parse(saved));
      }
    };

    loadData();
  }, [present]);

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) {
      setSavedMatchIds(JSON.parse(saved));
    }
  });

  const cancelNotification = async (id: number) => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  };

  const scheduleNotification = async (match: DisplayedMatch) => {
    const notificationTime = new Date(match.matchDate);
    notificationTime.setHours(notificationTime.getHours() - 1);

    if (notificationTime > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "¡Partido a punto de empezar!",
            body: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            id: match.id,
            schedule: { at: notificationTime },
          }
        ]
      });

      const newSavedMatchIds = [...savedMatchIds, match.id];
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);

      present({ message: `Partido guardado. Se te notificará una hora antes.`, duration: 3000, color: 'success' });
    } else {
      present({ message: 'Este partido ya ha comenzado o está a menos de una hora.', duration: 3000, color: 'warning' });
    }
  }

  const handleToggleSaveMatch = async (match: DisplayedMatch) => {
    if (savedMatchIds.includes(match.id)) {
      // Unsave the match
      const newSavedMatchIds = savedMatchIds.filter(id => id !== match.id);
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);
      await cancelNotification(match.id); // Cancel notification
      present({ message: 'Partido desguardado.', duration: 2000, color: 'medium' });
    } else {
      // Save the match
      try {
        let permissions: PermissionStatus = await LocalNotifications.checkPermissions();

        if (permissions.display === 'denied') {
          present({ message: 'Permiso de notificación denegado. Por favor, habilítalo en los ajustes de la app.', duration: 5000, color: 'danger' });
          return;
        }

        if (permissions.display !== 'granted') {
          permissions = await LocalNotifications.requestPermissions();
        }

        if (permissions.display === 'granted') {
          await scheduleNotification(match);
        } else {
          present({ message: 'No se concedieron los permisos de notificación. No se puede guardar el partido.', duration: 5000, color: 'warning' });
        }
      } catch (error: unknown) {
        console.error("Error handling match save:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        present({ message: `Error al guardar: ${message}`, duration: 4000, color: 'danger' });
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonText>
              <h3>Cargando partidos...</h3>
              <p>Por favor espera un momento</p>
            </IonText>
          </div>
        ) : matches.length > 0 ? (
          <IonList>
            {matches.map((match) => (
              <div key={match.id} className="match-card">
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
            <IonText>
              <h3>No hay partidos disponibles</h3>
              <p>Los partidos se cargarán automáticamente cuando estén disponibles</p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
