 import { IonContent, IonPage, IonList , IonLabel, IonText, IonButton, useIonToast, IonIcon, useIonViewWillEnter } from '@ionic/react';
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
      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 className="ion-text-center">Partidos Guardados</h2>
          <p className="ion-text-center">Aquí puedes ver los partidos que has marcado como favoritos.</p>
        </IonText>
        {displayedFavoriteMatches.length > 0 ? (
          <IonList>
            {displayedFavoriteMatches.map(match => (
              <div key={match.id} className="match-card" style={{margin: '15px 0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', background: 'var(--ion-background-color, white)'}}>
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
                  <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1'}}>
                      <img src={match.home.img} alt={match.home.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--ion-color-light)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '8px'}} />
                      <IonLabel style={{fontSize: '0.9em'}}>{match.home.name}</IonLabel>
                    </div>
                    <div style={{fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)', background: 'var(--ion-color-light)', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
                      VS
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1'}}>
                      <img src={match.away.img} alt={match.away.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--ion-color-light)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '8px'}} />
                      <IonLabel style={{fontSize: '0.9em'}}>{match.away.name}</IonLabel>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <IonButton
                      fill="clear"
                      className="favorite-button favorited"
                      onClick={() => handleToggleSaveMatch(match)}
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
          <IonText className="ion-text-center">
            <p>Aún no tienes partidos favoritos. ¡Explora y añade algunos!</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
