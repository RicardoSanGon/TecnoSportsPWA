import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, useIonToast, IonRouterLink, IonIcon, IonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { fingerPrint } from 'ionicons/icons';
import './Login.css';

const USER_STORAGE_KEY = 'app_user';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false); // Nuevo estado
  const [present] = useIonToast();
  const history = useHistory();

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          setIsBiometricAvailable(true);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error checking biometric availability:', errorMessage);
        present({ message: `Error al verificar biometría: ${errorMessage}`, duration: 4000, color: 'danger' });
      }
    };
    checkBiometric();
  }, [present]);

  const triggerBiometricVerification = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Verificación de seguridad adicional",
        title: "Verificar Identidad",
        subtitle: "Usa tu huella para completar el inicio de sesión",
      });

      present({ message: '¡Verificación biométrica exitosa! Redirigiendo...', duration: 2000, color: 'success' });
      history.push('/home'); // Redirigir después de la verificación exitosa

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Fallo en la verificación biométrica:', errorMessage);
      present({ message: `Fallo en la verificación biométrica: ${errorMessage}`, duration: 4000, color: 'danger' });
      setShowBiometricPrompt(false); // Ocultar el prompt si falla
    }
  };

  const handleLogin = async () => {
    /*
    // --- INICIO: EJEMPLO DE LLAMADA A LA API ---
    try {
      const response = await fetch('URL_DE_TU_API/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      // Suponiendo que la API devuelve un token u otros datos de usuario
      // localStorage.setItem('user_token', data.token);
      console.log('Inicio de sesión exitoso:', data);
      present({ message: '¡Inicio de sesión exitoso!', duration: 2000, color: 'success' });
      
      // --- INICIO: LÓGICA DE SEGUNDO FACTOR (API) ---
      if (isBiometricAvailable) {
        setShowBiometricPrompt(true); // Mostrar el prompt de huella
      } else {
        history.push('/tabs/home'); // Redirigir directamente si no hay biometría
      }
      // --- FIN: LÓGICA DE SEGUNDO FACTOR (API) ---

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error en el inicio de sesión:', errorMessage);
      present({ message: errorMessage || 'No se pudo iniciar sesión.', duration: 3000, color: 'danger' });
    }
    // --- FIN: EJEMPLO DE LLAMADA A LA API ---
    */

    // --- INICIO: LÓGICA SIMULADA (eliminar cuando la API esté lista) ---
    console.log("Usando lógica simulada. Descomenta el código de la API cuando esté lista.");
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) {
      present({ message: 'No hay ninguna cuenta registrada. Por favor, regístrate.', duration: 3000, color: 'warning' });
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.email === email && user.password === password) {
      present({ message: '¡Inicio de sesión exitoso! Verificando huella...', duration: 2000, color: 'success' });
      // --- INICIO: LÓGICA DE SEGUNDO FACTOR (SIMULADA) ---

        history.push('/tabs/home'); // Redirigir directamente si no hay biometría
      
      // --- FIN: LÓGICA DE SEGUNDO FACTOR (SIMULADA) ---
    } else {
      present({ message: 'Correo o contraseña incorrectos.', duration: 3000, color: 'danger' });
    }
    // --- FIN: LÓGICA SIMULADA ---
  };

  const handleBiometricLogin = async () => { 
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) {
      present({ message: 'No hay ninguna cuenta registrada para usar la autenticación por huella.', duration: 3000, color: 'warning' });
      return;
    }
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Para un inicio de sesión más fácil",
        title: "Iniciar Sesión",
        subtitle: "Usa tu huella para continuar",
      });

      present({ message: '¡Inicio de sesión biométrico exitoso!', duration: 2000, color: 'success' });
      history.push('/tabs/home');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Biometric login failed', errorMessage);
      present({ message: `Fallo en el inicio de sesión biométrico: ${errorMessage}`, duration: 4000, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {!showBiometricPrompt ? ( // Mostrar formulario de login si no se está pidiendo la huella
          <>
            <IonList>
              <IonItem>
                <IonInput label="Correo Electrónico" labelPlacement="floating" type="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)}></IonInput>
              </IonItem>
              <IonItem>
                <IonInput label="Contraseña" labelPlacement="floating" type="password" value={password} onIonInput={(e) => setPassword(e.detail.value!)}></IonInput>
              </IonItem>
            </IonList>
            <IonButton expand="full" onClick={handleLogin} style={{ marginTop: '20px' }}>
              Iniciar Sesión
            </IonButton>
            {isBiometricAvailable && (
              <IonButton expand="full" fill="outline" onClick={handleBiometricLogin} style={{ marginTop: '10px' }}>
                <IonIcon slot="start" icon={fingerPrint}></IonIcon>
                Usar Huella Digital
              </IonButton>
            )}
            <div className="ion-text-center" style={{ marginTop: '20px' }}>
              <IonRouterLink routerLink="/register">¿No tienes una cuenta? Regístrate</IonRouterLink>
            </div>
          </>
        ) : ( // Mostrar prompt de huella si showBiometricPrompt es true
          <div className="ion-text-center" style={{ marginTop: '50px' }}>
            <IonIcon icon={fingerPrint} style={{ fontSize: '80px', color: 'var(--ion-color-primary)' }}></IonIcon>
            <IonText>
              <p>Por favor, verifica tu identidad con tu huella dactilar o rostro.</p>
            </IonText>
            <IonButton expand="full" onClick={triggerBiometricVerification} style={{ marginTop: '20px' }}>
              Verificar con Huella Digital
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};


export default Login;
