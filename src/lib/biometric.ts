const enc = new TextEncoder();

export async function biometricAvailable(): Promise<boolean> {
  return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
}

function randomChallenge(len = 32) {
  const b = new Uint8Array(len); crypto.getRandomValues(b); return b;
}

export function savedCredId(): ArrayBuffer | null {
  const b64 = localStorage.getItem('auth_credId');
  if (!b64) return null;
  try {
    const bin = atob(b64); const buf = new ArrayBuffer(bin.length); const view = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    return buf;
  } catch { return null; }
}
function storeCredId(id: ArrayBuffer) {
  let bin = ''; const view = new Uint8Array(id);
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i]);
  localStorage.setItem('auth_credId', btoa(bin));
  localStorage.setItem('auth_bio_enabled', '1');
}

export async function registerLocalBiometric(userId: number, userName: string, rpName = 'TecnoMusic') {
  if (!await biometricAvailable()) return false;
  // Registro local (challenge local). Para seguridad real: challenge del servidor.
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: randomChallenge(),
    rp: { name: rpName },
    user: { id: enc.encode(String(userId)), name: userName, displayName: userName },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    timeout: 60_000
  };
  const cred = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null;
  if (!cred) return false;
  storeCredId(cred.rawId);
  return true;
}

export async function verifyLocalBiometric(): Promise<boolean> {
  if (!await biometricAvailable()) return false;
  const id = savedCredId();
  if (!id) return false;
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge(),
    allowCredentials: [{ id, type: 'public-key', transports: ['internal'] }],
    userVerification: 'required',
    timeout: 60_000
  };
  const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
  return !!assertion; // Éxito de UI biométrica. (No hay verificación criptográfica local)
}

export const biometricsEnabled = () => localStorage.getItem('auth_bio_enabled') === '1';
export const disableBiometrics = () => { localStorage.removeItem('auth_bio_enabled'); localStorage.removeItem('auth_credId'); }