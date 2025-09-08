import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonLabel,
  IonText,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonBadge,
  IonIcon
} from '@ionic/react';
import { trophy, medal, ribbon } from 'ionicons/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface LeaderboardEntry {
  id: number;
  pool_id: number;
  user_id: number;
  total_points: number;
  position: number;
  user?: {
    name: string;
    email: string;
  };
  pool?: {
    name: string;
  };
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADERBOARD}`);
      if (!response.ok) {
        throw new Error('Error al cargar el ranking');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('No se pudo cargar el ranking. Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <IonIcon icon={trophy} color="warning" />;
      case 2:
        return <IonIcon icon={medal} color="medium" />;
      case 3:
        return <IonIcon icon={ribbon} color="tertiary" />;
      default:
        return <IonBadge color="primary">{position}</IonBadge>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'warning';
      case 2:
        return 'medium';
      case 3:
        return 'tertiary';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
          <IonText>
            <p>Cargando ranking...</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-text-center ion-padding">
          <IonText color="danger">
            <h3>Error</h3>
            <p>{error}</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Ranking Global</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <IonText>
            <h2 className="ion-text-center">Clasificación General</h2>
            <p className="ion-text-center">Los mejores jugadores de todas las quinelas</p>
          </IonText>
        </div>

        {leaderboard.length > 0 ? (
          <IonList>
            {leaderboard.map((entry, index) => (
              <IonCard key={entry.id} className={entry.position <= 3 ? 'top-player-card' : ''}>
                <IonCardContent>
                  <div className="leaderboard-item">
                    <div className="position-section">
                      {getPositionIcon(entry.position)}
                    </div>
                    <div className="player-info">
                      <IonLabel>
                        <h3>{entry.user?.name || 'Usuario desconocido'}</h3>
                        <p>{entry.pool?.name || 'Quinela desconocida'}</p>
                      </IonLabel>
                    </div>
                    <div className="points-section">
                      <IonBadge color={getPositionColor(entry.position)}>
                        {entry.total_points} pts
                      </IonBadge>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText>
              <p>No hay datos de ranking disponibles</p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Leaderboard;