import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  useIonToast
} from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { people, personAdd, statsChart } from 'ionicons/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface Pool {
  id: number;
  name: string;
  description: string;
  creator_id: number;
  invitation_code: string;
  max_participants: number;
  is_close: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    name: string;
    email: string;
  };
}

interface PoolParticipant {
  id: number;
  pool_id: number;
  user_id: number;
  joined_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  week_number: number;
  score_home: number | null;
  score_away: number | null;
  status: string;
  home_team?: {
    name: string;
    logo_url: string;
  };
  away_team?: {
    name: string;
    logo_url: string;
  };
}

interface RouteParams {
  id: string;
}

const PoolDetails: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const poolId = parseInt(match.params.id);
  const [pool, setPool] = useState<Pool | null>(null);
  const [participants, setParticipants] = useState<PoolParticipant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [present] = useIonToast();

  // Simular si el usuario actual es el creador
  const currentUserId = 1; // Esto debería venir del contexto de autenticación
  const isCreator = pool?.creator_id === currentUserId;

  useEffect(() => {
    fetchPoolDetails();
  }, [poolId]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);

      // Fetch pool details
      const poolResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.POOL_BY_ID(poolId)}`);
      if (!poolResponse.ok) {
        throw new Error('Error al cargar los detalles de la quinela');
      }
      const poolData = await poolResponse.json();
      setPool(poolData);

      // Fetch participants
      const participantsResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.POOL_PARTICIPANTS(poolId)}`);
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData);
      }

      // Fetch matches (simulated for now)
      // In a real app, you'd fetch matches related to this pool
      setMatches([]);

    } catch (err) {
      console.error('Error fetching pool details:', err);
      setError('No se pudieron cargar los detalles de la quinela. Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationCode = () => {
    if (pool?.invitation_code) {
      navigator.clipboard.writeText(pool.invitation_code);
      present({ message: 'Código copiado al portapapeles', duration: 2000, color: 'success' });
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
          <IonText>
            <p>Cargando detalles...</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !pool) {
    return (
      <IonPage>
        <IonContent className="ion-text-center ion-padding">
          <IonText color="danger">
            <h3>Error</h3>
            <p>{error || 'Quinela no encontrada'}</p>
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
            <IonTitle size="large">{pool.name}</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Pool Info Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información de la Quinela</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Descripción:</strong> {pool.description}</p>
            <p><strong>Creador:</strong> {pool.creator?.name || 'Desconocido'}</p>
            <p><strong>Código de invitación:</strong> {pool.invitation_code}</p>
            <p><strong>Participantes:</strong> {participants.length}/{pool.max_participants}</p>
            <p><strong>Estado:</strong>
              <IonBadge color={pool.is_active ? 'success' : 'danger'} className="ion-margin-start">
                {pool.is_active ? 'Activa' : 'Inactiva'}
              </IonBadge>
            </p>
            {pool.end_date && (
              <p><strong>Fecha límite:</strong> {new Date(pool.end_date).toLocaleDateString()}</p>
            )}
          </IonCardContent>
        </IonCard>

        {/* Participants Section */}
        <div className="ion-padding">
          <IonText>
            <h3>Participantes ({participants.length})</h3>
          </IonText>
        </div>

        {participants.length > 0 ? (
          <IonList>
            {participants.map((participant) => (
              <IonItem key={participant.id}>
                <IonIcon icon={people} slot="start" />
                <IonLabel>
                  <h3>{participant.user?.name || 'Usuario desconocido'}</h3>
                  <p>Unido: {new Date(participant.joined_at).toLocaleDateString()}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText>
              <p>No hay participantes aún</p>
            </IonText>
          </div>
        )}

        {/* Copy Invitation Code Button */}
        {isCreator && (
          <div className="ion-padding">
            <IonButton expand="full" onClick={copyInvitationCode}>
              <IonIcon slot="start" icon={personAdd} />
              Copiar Código de Invitación
            </IonButton>
          </div>
        )}

        {/* Floating Action Button for Creator */}
        {isCreator && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton>
              <IonIcon icon={statsChart} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PoolDetails;