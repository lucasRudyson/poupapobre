import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricsService = {
  /**
   * Verifica se o dispositivo possui hardware de biometria e se há biometrias cadastradas.
   */
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    console.log('DEBUG: Hardware de biometria detectado:', hasHardware);
    console.log('DEBUG: Biometrias cadastradas no sistema:', isEnrolled);
    return hasHardware && isEnrolled;
  },

  /**
   * Dispara a autenticação biométrica.
   */
  async authenticate(promptMessage: string = 'Acesse sua conta'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  /**
   * Retorna os tipos de biometria suportados (Fingerprint, Facial, etc).
   */
  async getSupportedTypes() {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  }
};
