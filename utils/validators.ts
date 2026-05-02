/**
 * Utilitários de validação universal para o PoupaPobre
 */

/**
 * Valida se uma data está no presente ou no passado.
 * Impede a seleção de datas futuras.
 * 
 * @param date A data a ser validada
 * @returns boolean true se for hoje ou passado, false se for futuro
 */
export const isValidPastOrPresent = (date: Date): boolean => {
  const today = new Date();
  // Zeramos as horas para comparar apenas os dias
  const compareDate = new Date(date.getTime());
  today.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate <= today;
};

/**
 * Retorna um objeto de validação com status e mensagem de erro amigável.
 */
export const validateDateSelection = (date: Date) => {
  if (!isValidPastOrPresent(date)) {
    return {
      isValid: false,
      message: 'Você não pode viajar no tempo! Escolha uma data de hoje ou do passado. 🚀',
    };
  }
  return {
    isValid: true,
    message: '',
  };
};
