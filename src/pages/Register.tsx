import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, useIonToast, IonRouterLink } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Register.css';

const USER_STORAGE_KEY = 'app_user';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [present] = useIonToast();
  const history = useHistory();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      present({ message: 'Por favor, completa todos los campos.', duration: 2000, color: 'warning' });
      return;
    }

    /*
    // --- INICIO: EJEMPLO DE LLAMADA A LA API ---
    try {
      const response = await fetch('URL_DE_TU_API/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // Si el servidor responde con un error (ej. 400, 500)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);
      present({ message: '¡Registro exitoso! Ahora inicia sesión.', duration: 3000, color: 'success' });
      history.push('/login');

    } catch (error: any) {
      console.error('Error en el registro:', error);
      present({ message: error.message || 'No se pudo completar el registro.', duration: 3000, color: 'danger' });
    }
    // --- FIN: EJEMPLO DE LLAMADA A LA API ---
    */

    // --- INICIO: LÓGICA SIMULADA (eliminar cuando la API esté lista) ---
    console.log("Usando lógica simulada. Descomenta el código de la API cuando esté lista.");
    const userData = { name, email, password };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    present({ message: '¡Registro exitoso! Ahora inicia sesión.', duration: 3000, color: 'success' });
    history.push('/login');
    // --- FIN: LÓGICA SIMULADA ---
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonInput label="Nombre" labelPlacement="floating" value={name} onIonInput={(e) => setName(e.detail.value!)}></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="Correo Electrónico" labelPlacement="floating" type="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)}></IonInput>
          </IonItem>
          <IonItem>
            <IonInput label="Contraseña" labelPlacement="floating" type="password" value={password} onIonInput={(e) => setPassword(e.detail.value!)}></IonInput>
          </IonItem>
        </IonList>
        <IonButton expand="full" onClick={handleRegister} style={{ marginTop: '20px' }}>
          Registrarse
        </IonButton>
        <div className="ion-text-center" style={{ marginTop: '20px' }}>
          <IonRouterLink routerLink="/login">¿Ya tienes una cuenta? Inicia Sesión</IonRouterLink>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
