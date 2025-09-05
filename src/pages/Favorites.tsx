import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonText, IonButtons, IonButton, IonBackButton, useIonToast, IonIcon, useIonViewWillEnter } from '@ionic/react';
import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { bookmark } from 'ionicons/icons';
import './Favorites.css';

// Interfaces for type safety (copied from Home.tsx)
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

const Favorites: React.FC = () => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [savedMatchIds, setSavedMatchIds] = useState<number[]>([]);
  const [displayedFavoriteMatches, setDisplayedFavoriteMatches] = useState<Match[]>([]);
  const [present] = useIonToast();

  useEffect(() => {
    // Fetch all matches from the JSON file
    fetch('/matches.json')
      .then(response => response.json())
      .then(data => setAllMatches(data))
      .catch(error => console.error("Error fetching matches:", error));

    // Load saved match IDs from localStorage
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) {
      setSavedMatchIds(JSON.parse(saved));
    }
  }, []);

  useIonViewWillEnter(() => {
    // Reload saved match IDs when returning to this page
    const saved = localStorage.getItem(SAVED_MATCHES_KEY);
    if (saved) {
      setSavedMatchIds(JSON.parse(saved));
    }
  });

  useEffect(() => {
    // Filter all matches to get only the favorited ones
    if (allMatches.length > 0 && savedMatchIds.length > 0) {
      const favorites = allMatches.filter(match => savedMatchIds.includes(match.id));
      setDisplayedFavoriteMatches(favorites);
    } else if (savedMatchIds.length === 0) {
      setDisplayedFavoriteMatches([]); // Clear favorites if none are saved
    }
  }, [allMatches, savedMatchIds]);

  const cancelNotification = async (id: number) => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  };

  const handleToggleSaveMatch = async (match: Match) => {
    // In Favorites page, we only allow unsaving
    const newSavedMatchIds = savedMatchIds.filter(id => id !== match.id);
    localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(newSavedMatchIds));
    setSavedMatchIds(newSavedMatchIds); // This will trigger the useEffect to update displayedFavoriteMatches
    await cancelNotification(match.id); // Cancel notification
    present({ message: 'Partido desguardado.', duration: 2000, color: 'medium' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home"></IonBackButton>
          </IonButtons>
          <IonTitle>Mis Favoritos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 className="ion-text-center">Partidos Guardados</h2>
          <p className="ion-text-center">Aquí puedes ver los partidos que has marcado como favoritos.</p>
        </IonText>
        {displayedFavoriteMatches.length > 0 ? (
          <IonList>
            {displayedFavoriteMatches.map(match => (
              <IonItem key={match.id}>
                <IonLabel>
                  <h2>{match.home.name} vs {match.away.name}</h2>
                  <p>Fecha: {new Date(match.date).toLocaleString()}</p>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="clear"
                  onClick={() => handleToggleSaveMatch(match)}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={bookmark}
                    color="primary"
                  ></IonIcon>
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <IonText className="ion-text-center">
            <p>Aún no tienes partidos favoritos. ¡Explora y añade algunos!</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
