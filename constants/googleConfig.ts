/**
 * Google OAuth Configuration — PoupaPobre
 *
 * ─────────────────────────────────────────────────────────────────────────
 * COMO CONFIGURAR:
 *
 * 1. Acesse https://console.cloud.google.com
 * 2. Crie um projeto (ou selecione um existente)
 * 3. Vá em "APIs e Serviços" → "Ativar APIs" → ative "Google People API"
 * 4. Vá em "APIs e Serviços" → "Credenciais" → "Criar credencial"
 *
 * Você precisa criar DOIS tipos de Client ID:
 *
 * ── Para Expo Go (desenvolvimento) ──────────────────────────────────────
 * Tipo: "Aplicativo da Web"
 * URI de redirecionamento autorizado: https://auth.expo.io/@SEU_USUARIO_EXPO/poupapobre
 * → Cole o "Client ID" no campo `expoClientId` abaixo
 *
 * ── Para Android (build nativo) ─────────────────────────────────────────
 * Tipo: "Android"
 * Nome do pacote: com.poupapobre (definido no app.json > android > package)
 * SHA-1: rode `cd android && ./gradlew signingReport` para obter
 * → Cole o "Client ID" no campo `androidClientId` abaixo
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

export const GOOGLE_CONFIG = {
  /**
   * Client ID do tipo "Web" — usado pelo Expo Go via proxy auth.expo.io
   * Projeto: Default Gemini Project | Nome: poupapobre-expo-web
   */
  expoClientId: '893547210356-eea3l52gc3iomqvoke5k7fu9jpk56r3b.apps.googleusercontent.com',

  /**
   * Client ID do tipo "Android" — usado em builds nativos (development build / EAS Build)
   * Projeto: Default Gemini Project | Nome: poupapobre-android
   */
  androidClientId: '893547210356-p2j7slsboues59294pken14a216oq0ag.apps.googleusercontent.com',

  /**
   * Client ID do tipo "iOS" — usado em builds nativos iOS
   * (ainda não configurado — adicione quando for publicar no iOS)
   */
  iosClientId: '',

  /**
   * Web Client ID — igual ao expoClientId
   */
  webClientId: '893547210356-eea3l52gc3iomqvoke5k7fu9jpk56r3b.apps.googleusercontent.com',
};

/** Indica se as credenciais já foram configuradas */
export const isGoogleConfigured = (): boolean => {
  return GOOGLE_CONFIG.expoClientId.length > 0 && !GOOGLE_CONFIG.expoClientId.startsWith('SEU_');
};
