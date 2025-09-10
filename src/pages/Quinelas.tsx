import React, { useState, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  useIonToast,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonTextarea,
  useIonViewWillEnter,
  IonAlert,
  IonSpinner,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add, people, trophy, create } from 'ionicons/icons';
import { API_ENDPOINTS } from '../config/api';
import { cachedFetch } from '../utils/apiCache';
import './Quinelas.css';

// Updated interfaces to match API response
interface Participant {
  id: number;
  name: string;
  email: string;
}

interface Pool {
  id: number;
  name: string;
  description: string;
  invitationCode: number;
  maxParticipants: number;
  creatorId?: number;
  currentParticipants?: number; // From owned pools API
  participants?: Participant[];
  isActive: boolean;
  isClose: boolean;
  startDate: string;
  endDate: string;
  _count?: {
    participants: number;
  };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const Quinelas: React.FC = () => {
  const [joinedPools, setJoinedPools] = useState<Pool[]>([]);
  const [ownedPools, setOwnedPools] = useState<Pool[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<'joined' | 'owned'>('joined');

  // Form state for creating a pool
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolDescription, setNewPoolDescription] = useState('');
  const [newPoolMaxParticipants, setNewPoolMaxParticipants] = useState(20);

  const [present] = useIonToast();
  const history = useHistory();

  const fetchUserProfile = useCallback(() => {
    try {
      const profileStr = localStorage.getItem('userProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setUserProfile(profile);
        return profile;
      } else {
        present({ message: 'Debes iniciar sesión para ver tus quinielas.', duration: 3000, color: 'warning' });
        history.push('/login');
      }
    } catch (error) {
      console.error("Error parsing user profile:", error);
      present({ message: 'Error al cargar tu perfil. Por favor, inicia sesión de nuevo.', duration: 3000, color: 'danger' });
      history.push('/login');
    }
    return null;
  }, [present, history]);

  const fetchUserPools = useCallback(async (profile: UserProfile) => {
    if (!profile) return;
    setLoading(true);
    try {
      // Fetch joined pools
      const joinedResponse = await cachedFetch(API_ENDPOINTS.POOLS_JOINED_BY_USER(profile.id));
      if (!joinedResponse.ok) {
        const errorData = await joinedResponse.json();
        throw new Error(errorData.message || 'Error al cargar las quinielas unidas');
      }
      const joinedData = await joinedResponse.json();
      setJoinedPools(joinedData.data.pools || []);

      // Fetch owned pools
      const ownedResponse = await cachedFetch(API_ENDPOINTS.POOLS_OWNED_BY_USER(profile.id));
      if (!ownedResponse.ok) {
        const errorData = await ownedResponse.json();
        throw new Error(errorData.message || 'Error al cargar las quinielas creadas');
      }
      const ownedData = await ownedResponse.json();
      
      // Process owned pools to ensure correct participant count
      const processedOwnedPools = (ownedData.data.pools || []).map((pool: Pool) => ({
        ...pool,
        // Use actual participants array length if available, otherwise use currentParticipants
        currentParticipants: pool.participants ? pool.participants.length : (pool.currentParticipants || 0)
      }));
      
      setOwnedPools(processedOwnedPools);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
      console.error('Error fetching pools:', errorMessage);
      present({ message: errorMessage, duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [present]);

  useIonViewWillEnter(() => {
    const profile = fetchUserProfile();
    if (profile) {
      fetchUserPools(profile);
    }
  });

  const handleJoinPool = async (invitationCode: string) => {
    if (!invitationCode || invitationCode.trim() === '') {
      present({ message: 'Por favor, introduce un código de invitación válido.', duration: 2000, color: 'warning' });
      return;
    }
    if (!userProfile) return;

    try {
      const response = await cachedFetch(API_ENDPOINTS.JOIN_POOL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationCode: Number(invitationCode),
          userId: userProfile.id
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'No se pudo unir a la quiniela.');
      }

      present({ message: '¡Te has unido a la quiniela exitosamente!', duration: 3000, color: 'success' });
      if (userProfile) fetchUserPools(userProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
      present({ message: errorMessage, duration: 3000, color: 'danger' });
    }
  };

  const handleCreatePool = async () => {
    if (!newPoolName.trim()) {
      present({ message: 'El nombre de la quiniela es obligatorio.', duration: 2000, color: 'warning' });
      return;
    }
    if (!userProfile) return;

    const invitationCode = Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await cachedFetch(API_ENDPOINTS.CREATE_POOL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPoolName,
          description: newPoolDescription,
          maxParticipants: Number(newPoolMaxParticipants),
          invitationCode: invitationCode,
          creatorId: userProfile.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'No se pudo crear la quiniela.');
      }

      present({ message: `Quiniela "${newPoolName}" creada. Código de invitación: ${invitationCode}`, duration: 5000, color: 'success' });
      setShowCreateModal(false);
      setNewPoolName('');
      setNewPoolDescription('');
      setNewPoolMaxParticipants(20);
      if (userProfile) fetchUserPools(userProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
      present({ message: errorMessage, duration: 3000, color: 'danger' });
    }
  };

  const handlePoolClick = (poolId: number) => {
    history.push(`/tabs/pool/${poolId}`);
  };

  // Helper function to get participant count based on pool type
  const getParticipantCount = (pool: Pool) => {
    if (selectedSegment === 'owned') {
      // For owned pools, use the processed currentParticipants or participants array length
      return pool.participants ? pool.participants.length : (pool.currentParticipants || 0);
    } else {
      // For joined pools, use _count.participants if available
      return pool._count?.participants || 0;
    }
  };

  const poolsToDisplay = selectedSegment === 'joined' ? joinedPools : ownedPools;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Quinelas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          <IonButton expand="full" onClick={() => setShowJoinAlert(true)}>
            <IonIcon slot="start" icon={create} />
            Unirse a una Quiniela
          </IonButton>
        </div>

        <IonSegment value={selectedSegment} onIonChange={e => setSelectedSegment(e.detail.value as 'joined' | 'owned')}>
          <IonSegmentButton value="joined">
            <IonText>Unidas</IonText>
          </IonSegmentButton>
          <IonSegmentButton value="owned">
            <IonText>Creadas</IonText>
          </IonSegmentButton>
        </IonSegment>

        <div className="ion-padding-horizontal">
          <IonText><h3>{selectedSegment === 'joined' ? 'Mis Quinelas Unidas' : 'Mis Quinelas Creadas'}</h3></IonText>
        </div>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>Cargando quinelas...</p>
          </div>
        ) : poolsToDisplay.length > 0 ? (
          <IonList>
            {poolsToDisplay.map((pool) => (
              <IonCard key={pool.id} button onClick={() => handlePoolClick(pool.id)}>
                <IonCardHeader>
                  <IonCardTitle className="ion-text-start">{pool.name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>{pool.description}</p>
                  <div className="pool-info">
                    <IonIcon icon={people} />
                    <span>{getParticipantCount(pool)}/{pool.maxParticipants}</span>
                    <IonIcon icon={trophy} style={{ marginLeft: '15px' }} />
                    <span>Código: {pool.invitationCode}</span>
                  </div>
                  {/* Show pool status for owned pools */}
                  {selectedSegment === 'owned' && (
                    <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                      Estado: {pool.isActive ? 'Activa' : 'Inactiva'} • {pool.isClose ? 'Cerrada' : 'Abierta'}
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText>
              <p>No hay quinielas {selectedSegment === 'joined' ? 'unidas' : 'creadas'} disponibles.</p>
            </IonText>
          </div>
        )}

        {/* Join Pool Alert */}
        <IonAlert
          isOpen={showJoinAlert}
          onDidDismiss={() => setShowJoinAlert(false)}
          header={'Unirse a Quiniela'}
          message={'Introduce el código de invitación de 6 dígitos.'}
          inputs={[
            {
              name: 'invitationCode',
              type: 'number',
              placeholder: '123456',
              min: 100000,
              max: 999999,
            },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Unirse',
              handler: (alertData) => handleJoinPool(alertData.invitationCode),
            },
          ]}
        />

        {/* Create Pool Modal */}
        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Crear Nueva Quiniela</IonTitle>
              <IonButton slot="end" fill="clear" color="light" onClick={() => setShowCreateModal(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonInput
                  label="Nombre de la Quinela"
                  labelPlacement="floating"
                  value={newPoolName}
                  onIonInput={(e) => setNewPoolName(e.detail.value!)}
                  placeholder="Ej: Mundial 2026"
                />
              </IonItem>
              <IonItem>
                <IonTextarea
                  label="Descripción"
                  labelPlacement="floating"
                  value={newPoolDescription}
                  onIonInput={(e) => setNewPoolDescription(e.detail.value!)}
                  placeholder="Predicciones para los partidos del mundial."
                  rows={3}
                  autoGrow={true}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Máx. de Participantes"
                  labelPlacement="floating"
                  type="number"
                  value={newPoolMaxParticipants}
                  onIonInput={(e) => setNewPoolMaxParticipants(parseInt(e.detail.value!, 10))}
                />
              </IonItem>
            </IonList>
            <IonButton expand="full" onClick={handleCreatePool} style={{ marginTop: '20px' }}>
              <IonIcon slot="start" icon={create} />
              Crear Quiniela
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Floating Action Button to Create */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowCreateModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Quinelas;