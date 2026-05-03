import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from './database';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

export interface GoogleAuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    onboarding_completed: number;
  };
  isNewUser: boolean;
}

// ─── Busca dados do usuário no Google ────────────────────────────────────────

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google userinfo error:', response.status, errorText);
    throw new Error('Falha ao buscar informações do usuário Google.');
  }

  const data = await response.json();
  return data as GoogleUserInfo;
}

// ─── Salva/atualiza usuário no banco e retorna resultado ─────────────────────

export async function handleGoogleAuthResult(userInfo: GoogleUserInfo): Promise<GoogleAuthResult> {
  const db = await getDatabase();

  type UserRow = {
    id: number;
    name: string;
    email: string;
    onboarding_completed: number;
  };

  // 1. Busca pelo google_id
  let user = await db.getFirstAsync<UserRow>(
    'SELECT id, name, email, onboarding_completed FROM users WHERE google_id = ?',
    [userInfo.id]
  );

  if (user) {
    // Usuário já existe — atualiza nome e avatar (podem ter mudado)
    await db.runAsync(
      'UPDATE users SET name = ?, avatar_url = ? WHERE google_id = ?',
      [userInfo.name, userInfo.picture ?? null, userInfo.id]
    );

    await AsyncStorage.setItem('last_user_email', user.email);
    return { user, isNewUser: false };
  }

  // 2. Verifica se o e-mail já está cadastrado manualmente
  const existingByEmail = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE email = ?',
    [userInfo.email]
  );

  if (existingByEmail) {
    // Vincula o google_id à conta manual existente
    await db.runAsync(
      'UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?',
      [userInfo.id, userInfo.picture ?? null, existingByEmail.id]
    );

    user = await db.getFirstAsync<UserRow>(
      'SELECT id, name, email, onboarding_completed FROM users WHERE id = ?',
      [existingByEmail.id]
    );

    if (!user) throw new Error('Erro ao recuperar usuário vinculado.');

    await AsyncStorage.setItem('last_user_email', user.email);
    return { user, isNewUser: false };
  }

  // 3. Cria nova conta via Google
  await db.runAsync(
    'INSERT INTO users (name, email, password, google_id, avatar_url) VALUES (?, ?, ?, ?, ?)',
    [userInfo.name, userInfo.email, '', userInfo.id, userInfo.picture ?? null]
  );

  user = await db.getFirstAsync<UserRow>(
    'SELECT id, name, email, onboarding_completed FROM users WHERE google_id = ?',
    [userInfo.id]
  );

  if (!user) throw new Error('Erro ao criar usuário Google.');

  await AsyncStorage.setItem('last_user_email', user.email);
  return { user, isNewUser: true };
}
