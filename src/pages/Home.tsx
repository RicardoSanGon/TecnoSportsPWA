import { IonContent, IonPage, IonList, IonLabel, IonButton, useIonToast, IonIcon, useIonViewWillEnter, IonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
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

  const scheduleNotification = async (match: DisplayedMatch) => {
    const now = new Date();
    const matchDate = new Date(match.matchDate);

    const notifications = [];

    // Notification 1: One hour before
    const oneHourBefore = new Date(matchDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      notifications.push({
        id: match.id * 1000 + 1, // Unique ID for this notification
        title: "¡Partido a punto de empezar!",
        body: `${match.homeTeam.name} vs ${match.awayTeam.name} en una hora.`,
        schedule: { at: oneHourBefore },
      });
    }

    // Notification 2: At match time
    if (matchDate > now) {
      notifications.push({
        id: match.id * 1000 + 2, // Unique ID for this notification
        title: "¡El partido ha comenzado!",
        body: `El partido ${match.homeTeam.name} vs ${match.awayTeam.name} acaba de empezar.`,
        schedule: { at: matchDate },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      present({ message: 'Partido guardado. Se te notificará antes y al empezar.', duration: 3000, color: 'success' });
    } else {
      present({ message: 'Partido guardado. El partido ya ha comenzado.', duration: 3000, color: 'medium' });
    }
  }

  const handleToggleSaveMatch = async (match: DisplayedMatch) => {
    if (savedMatchIds.includes(match.id)) {
      // Unsave the match
      const newSavedMatchIds = savedMatchIds.filter(id => id !== match.id);
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);
      
      // Cancel both notifications
      await LocalNotifications.cancel({ notifications: [
        { id: match.id * 1000 + 1 },
        { id: match.id * 1000 + 2 }
      ]});

      present({ message: 'Partido desguardado.', duration: 2000, color: 'medium' });
    } else {
      // Save the match unconditionally first
      const newSavedMatchIds = [...savedMatchIds, match.id];
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
      setSavedMatchIds(newSavedMatchIds);

      // Then, handle notifications
      try {
        let permissions: PermissionStatus = await LocalNotifications.checkPermissions();

        if (permissions.display === 'prompt') {
          permissions = await LocalNotifications.requestPermissions();
        }

        if (permissions.display === 'granted') {
          await scheduleNotification(match);
        } else {
          // If permission is denied or anything else, show the custom message
          present({
            message: 'Partido guardado. Descargue la aplicación para recibir notificaciones.',
            duration: 4000,
            color: 'success'
          });
        }
      } catch (error) {
        console.error("Error handling notifications:", error);
        // Fallback message if notification system fails for any reason
        present({
          message: 'Partido guardado. Descargue la aplicación para recibir notificaciones.',
          duration: 4000,
          color: 'success'
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