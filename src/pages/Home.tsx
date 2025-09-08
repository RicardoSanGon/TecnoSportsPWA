import { IonContent, IonPage, IonList, IonLabel, IonButton, useIonToast, IonIcon, useIonViewWillEnter, IonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { bookmark, bookmarkOutline } from 'ionicons/icons'; // Importar iconos de bookmark
import './Home.css';

// Interfaces for type safety
interface Team {
  img: string;
  name: string;
}

interface Match {
  id: number;
  home: Team;
  away: Team;
  date: string;
}

const SAVED_MATCHES_KEY = 'savedMatches';

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [savedMatchIds, setSavedMatchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch matches from the JSON file
        const response = await fetch('/matches.json');
        const data = await response.json();
        setMatches(data);
        console.log('Matches loaded:', data); // Debug log
      } catch (error) {
        console.error("Error fetching matches:", error);
        present({ message: 'Error al cargar los partidos', duration: 3000, color: 'danger' });
      }

      // Load saved matches from localStorage
      const saved = localStorage.getItem(SAVED_MATCHES_KEY);
      if (saved) {
        setSavedMatchIds(JSON.parse(saved));
      }

      setLoading(false);
    };

    loadData();
  }, [present]);

  useIonViewWillEnter(() => {
    // Reload saved matches when returning to this page
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) {
      setSavedMatchIds(JSON.parse(saved));
    }
  });

  const cancelNotification = async (id: number) => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  };

  const scheduleNotification = async (match: Match) => {
    const notificationTime = new Date(match.date);
    notificationTime.setHours(notificationTime.getHours() - 1);

    if (notificationTime > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "¡Partido a punto de empezar!",
            body: `${match.home.name} vs ${match.away.name}`,
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

  const handleToggleSaveMatch = async (match: Match) => {
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
                    {new Date(match.date).toLocaleDateString('es-ES', {
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
                      <img src={match.home.img} alt={match.home.name} />
                      <IonLabel>{match.home.name}</IonLabel>
                    </div>
                    <div className="vs-label">VS</div>
                    <div className="team">
                      <img src={match.away.img} alt={match.away.name} />
                      <IonLabel>{match.away.name}</IonLabel>
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
