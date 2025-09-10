import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
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
import { API_ENDPOINTS } from '../config/api';
import { cachedFetch } from '../utils/apiCache';

interface Pool {
  id: number;
  name: string;
  description: string;
  invitationCode: number;
  maxParticipants: number;
  currentParticipants: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

interface PoolParticipant {
  id: number;
  pool_id: number;
  user_id: number;
  name: string; // Added directly
  email: string; // Added directly
  registeredAt: string; // Changed from joined_at
}


interface RouteParams {
  id: string;
}


const PoolDetails: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const poolId = parseInt(match.params.id);
  const [pool, setPool] = useState<Pool | null>(null);
  const [participants, setParticipants] = useState<PoolParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [present] = useIonToast();
  const [userProfile, setUserProfile] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    const profileStr = localStorage.getItem('userProfile');
    if (profileStr) {
      setUserProfile(JSON.parse(profileStr));
    }
  }, []);

  const currentUserId = userProfile?.id;
  const isCreator = pool?.creator?.id === currentUserId;

  useEffect(() => {
    if (currentUserId) {
      fetchPoolDetails();
    }
  }, [poolId, currentUserId]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching pool details for poolId:', poolId, 'userId:', currentUserId);

      // Use the correct endpoint that returns both pool and participants
      if (currentUserId) {
        const endpoint = API_ENDPOINTS.POOL_PARTICIPANTS_BY_USER(poolId, currentUserId);
        console.log('Using endpoint:', endpoint);

        const response = await cachedFetch(endpoint);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Error al cargar los detalles de la quinela: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (data.data && data.data.pool) {
          setPool(data.data.pool);
          setParticipants(data.data.participants || []);
          console.log('Pool and participants loaded successfully');
        } else {
          console.error('Invalid data structure:', data);
          throw new Error('La respuesta del servidor no tiene el formato esperado');
        }
      } else {
        console.error('No currentUserId available');
        throw new Error('Usuario no autenticado');
      }

    } catch (err) {
      console.error('Error fetching pool details:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los detalles de la quinela. Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationCode = () => {
    if (pool?.invitationCode) {
      navigator.clipboard.writeText(pool.invitationCode.toString());
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
        {/* Page Title */}
        <div className="ion-padding">
          <IonText>
            <h1>{pool.name}</h1>
          </IonText>
        </div>

        {/* Pool Info Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información de la Quinela</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Descripción:</strong> {pool.description}</p>
            <p><strong>Creador:</strong> {pool.creator?.name || 'Desconocido'}</p>
            <p><strong>Código de invitación:</strong> {pool.invitationCode}</p>
            <p><strong>Participantes:</strong> {pool.currentParticipants}/{pool.maxParticipants}</p>
            <p><strong>Estado:</strong>
              <IonBadge color="success" className="ion-margin-start">
                Activa
              </IonBadge>
            </p>
          </IonCardContent>
        </IonCard>

        {/* Conditional Content Based on Creator Status */}
        {isCreator ? (
          // Creator View - Show Participants and Management Options
          <>
            {/* Participants Section */}
            <div className="ion-padding">
              <IonText>
                <h3>Participantes ({pool.currentParticipants})</h3>
              </IonText>
            </div>

            {participants.length > 0 ? (
              <IonList>
                {participants.map((participant) => (
                  <IonItem key={participant.id}>
                    <IonIcon icon={people} slot="start" />
                    <IonLabel>
                      <h3>{participant.name || 'Usuario desconocido'}</h3>
                      <p>Unido: {new Date(participant.registeredAt).toLocaleDateString()}</p>
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
            <div className="ion-padding">
              <IonButton expand="full" onClick={copyInvitationCode}>
                <IonIcon slot="start" icon={personAdd} />
                Copiar Código de Invitación
              </IonButton>
            </div>

            {/* Floating Action Button for Creator */}
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton>
                <IonIcon icon={statsChart} />
              </IonFabButton>
            </IonFab>
          </>
        ) : (
          // Non-Creator View - Show Prediction Interface
          <>
            <div className="ion-padding">
              <IonText>
                <h3>Hacer Predicciones</h3>
                <p>Participa en esta quinela haciendo tus predicciones para los partidos.</p>
              </IonText>
            </div>

            {/* TODO: Add matches/predictions interface here */}
            <div className="ion-text-center ion-padding">
              <IonText>
                <p>Próximamente: Interfaz de predicciones</p>
              </IonText>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PoolDetails;