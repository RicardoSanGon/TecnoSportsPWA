import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonButton, useIonToast, IonButtons, IonIcon, useIonViewWillEnter } from '@ionic/react';
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
  const [present] = useIonToast();

  useEffect(() => {
    // Fetch matches from the JSON file
    fetch('/matches.json')
      .then(response => response.json())
      .then(data => setMatches(data))
      .catch(error => console.error("Error fetching matches:", error));

    // Load saved matches from localStorage
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) {
      setSavedMatchIds(JSON.parse(saved));
    }
  }, []);

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
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Partidos</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/quinelas">
              Quinelas
            </IonButton>
            <IonButton routerLink="/favorites">
              Favoritos
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Partidos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {matches.map((match) => (
            <IonCard key={match.id}>
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">{new Date(match.date).toLocaleString()}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
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
                    onClick={() => handleToggleSaveMatch(match)} 
                  >
                    <IonIcon 
                      slot="icon-only" 
                      icon={savedMatchIds.includes(match.id) ? bookmark : bookmarkOutline}
                      color={savedMatchIds.includes(match.id) ? "primary" : "medium"}
                    ></IonIcon>
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
