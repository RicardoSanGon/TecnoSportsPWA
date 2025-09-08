import React, { useState, useEffect } from 'react';
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
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonTextarea
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add, people, trophy, create } from 'ionicons/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import './Quinelas.css';

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
  _count?: {
    participants: number;
  };
}

const Quinelas: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolDescription, setNewPoolDescription] = useState('');
  const [present] = useIonToast();
  const history = useHistory();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.POOLS}`);
      if (!response.ok) {
        throw new Error('Error al cargar las quinelas');
      }
      const data = await response.json();
      setPools(data);
    } catch (err) {
      console.error('Error fetching pools:', err);
      // Fallback to mock data
      setPools([
        {
          id: 1,
          name: 'Quinela Champions 2024',
          description: 'Quinela para la Champions League 2024',
          creator_id: 1,
          invitation_code: 'CHAMP2024',
          max_participants: 20,
          is_close: false,
          is_active: true,
          start_date: '2024-09-01T00:00:00Z',
          end_date: null,
          created_at: '2024-09-01T00:00:00Z',
          updated_at: '2024-09-01T00:00:00Z',
          creator: { name: 'Admin', email: 'admin@example.com' },
          _count: { participants: 5 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQuinela = async () => {
    if (invitationCode.trim() === '') {
      present({ message: 'Por favor, introduce un código de invitación.', duration: 2000, color: 'warning' });
      return;
    }

    try {
      // In a real app, this would make an API call to join the pool
      present({ message: `Te has unido a la quinela con código ${invitationCode}.`, duration: 3000, color: 'success' });
      setInvitationCode('');
      fetchPools(); // Refresh the list
    } catch (err) {
      present({ message: 'Error al unirse a la quinela.', duration: 3000, color: 'danger' });
    }
  };

  const handleCreatePool = async () => {
    if (!newPoolName.trim()) {
      present({ message: 'Por favor, introduce un nombre para la quinela.', duration: 2000, color: 'warning' });
      return;
    }

    try {
      // In a real app, this would make an API call to create the pool
      const newPool: Pool = {
        id: Date.now(), // Mock ID
        name: newPoolName,
        description: newPoolDescription,
        creator_id: 1, // Mock creator ID
        invitation_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        max_participants: 20,
        is_close: false,
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: { name: 'Tú', email: 'user@example.com' },
        _count: { participants: 1 }
      };

      setPools(prev => [...prev, newPool]);
      setNewPoolName('');
      setNewPoolDescription('');
      setShowCreateModal(false);
      present({ message: 'Quinela creada exitosamente.', duration: 3000, color: 'success' });
    } catch (err) {
      present({ message: 'Error al crear la quinela.', duration: 3000, color: 'danger' });
    }
  };

  const handlePoolClick = (poolId: number) => {
    history.push(`/tabs/pool/${poolId}`);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Mis Quinelas</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Join Pool Section */}
        <div className="ion-padding">
          <IonText>
            <h3>Únete a una Quinela</h3>
            <p>Introduce el código de invitación para unirte a una quinela existente.</p>
          </IonText>
          <IonList>
            <IonItem>
              <IonInput
                label="Código de Invitación"
                labelPlacement="floating"
                type="text"
                value={invitationCode}
                onIonInput={(e) => setInvitationCode(e.detail.value!)}
                placeholder="Ej: CHAMP2024"
              />
            </IonItem>
          </IonList>
          <IonButton expand="full" onClick={handleJoinQuinela} style={{ marginTop: '10px' }}>
            <IonIcon slot="start" icon={add} />
            Unirse a Quinela
          </IonButton>
        </div>

        {/* My Pools Section */}
        <div className="ion-padding">
          <IonText>
            <h3>Mis Quinelas</h3>
          </IonText>
        </div>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonText>Cargando quinelas...</IonText>
          </div>
        ) : pools.length > 0 ? (
          <IonList>
            {pools.map((pool) => (
              <IonCard key={pool.id} button onClick={() => handlePoolClick(pool.id)}>
                <IonCardHeader>
                  <IonCardTitle className="ion-text-start">{pool.name}</IonCardTitle>
                  <IonBadge color={pool.is_active ? 'success' : 'danger'} slot="end">
                    {pool.is_active ? 'Activa' : 'Inactiva'}
                  </IonBadge>
                </IonCardHeader>
                <IonCardContent>
                  <p>{pool.description}</p>
                  <div className="pool-info">
                    <IonIcon icon={people} />
                    <span>{pool._count?.participants || 0}/{pool.max_participants} participantes</span>
                    <IonIcon icon={trophy} style={{ marginLeft: '15px' }} />
                    <span>Código: {pool.invitation_code}</span>
                  </div>
                  <p className="pool-date">
                    Creada: {new Date(pool.created_at).toLocaleDateString()}
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <div className="ion-text-center ion-padding">
            <IonText>
              <p>No tienes quinelas aún. ¡Crea una o únete a una existente!</p>
            </IonText>
          </div>
        )}

        {/* Create Pool Modal */}
        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Crear Nueva Quinela</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowCreateModal(false)}>
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
                  placeholder="Ej: Champions League 2024"
                />
              </IonItem>
              <IonItem>
                <IonTextarea
                  label="Descripción"
                  labelPlacement="floating"
                  value={newPoolDescription}
                  onIonInput={(e) => setNewPoolDescription(e.detail.value!)}
                  placeholder="Describe tu quinela..."
                  rows={3}
                />
              </IonItem>
            </IonList>
            <IonButton expand="full" onClick={handleCreatePool} style={{ marginTop: '20px' }}>
              <IonIcon slot="start" icon={create} />
              Crear Quinela
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Floating Action Button */}
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
