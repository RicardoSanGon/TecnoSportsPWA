import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, useIonToast, IonText, IonButtons, IonBackButton } from '@ionic/react';
import { useState } from 'react';
import './Quinelas.css';

const Quinelas: React.FC = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [present] = useIonToast();

  const handleJoinQuinela = () => {
    if (invitationCode.trim() === '') {
      present({ message: 'Por favor, introduce un código de invitación.', duration: 2000, color: 'warning' });
      return;
    }
    // Lógica simulada para unirse a una quinela
    console.log(`Intentando unirse a la quinela con código: ${invitationCode}`);
    present({ message: `Te has unido a la quinela ${invitationCode} (simulado).`, duration: 3000, color: 'success' });
    setInvitationCode(''); // Limpiar el input
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home"></IonBackButton>
          </IonButtons>
          <IonTitle>Quinelas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 className="ion-text-center">Únete a una Quinela</h2>
          <p className="ion-text-center">Introduce el código de invitación para unirte a una quinela existente.</p>
        </IonText>
        <IonList>
          <IonItem>
            <IonInput
              label="Código de Invitación"
              labelPlacement="floating"
              type="text"
              value={invitationCode}
              onIonInput={(e) => setInvitationCode(e.detail.value!)}
            ></IonInput>
          </IonItem>
        </IonList>
        <IonButton expand="full" onClick={handleJoinQuinela} style={{ marginTop: '20px' }}>
          Unirse a Quinela
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Quinelas;
