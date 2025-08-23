// 🛡️ Utilidades de validación y sanitización de datos
// Para prevenir XSS y otros ataques de inyección

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Sanitizar texto - remover caracteres peligrosos
export const sanitizeText = (input: string, maxLength = 500): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remover < y > para prevenir XSS básico
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/data:/gi, ''); // Remover data: URLs
};

// Validar números financieros
export const validateFinancialAmount = (amount: number): number => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new ValidationError('El monto debe ser un número válido');
  }
  
  if (amount < 0) {
    throw new ValidationError('El monto no puede ser negativo');
  }
  
  if (amount > 999999999999) { // 999 billones máximo
    throw new ValidationError('El monto es demasiado grande');
  }
  
  // Redondear a 2 decimales
  return Math.round(amount * 100) / 100;
};

// Validar fechas
export const validateDate = (dateString: string): string => {
  if (!dateString) {
    throw new ValidationError('La fecha es requerida');
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError('La fecha no es válida');
  }
  
  // Validar que no sea más de 100 años en el pasado o futuro
  const now = new Date();
  const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
  const hundredYearsFromNow = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
  
  if (date < hundredYearsAgo || date > hundredYearsFromNow) {
    throw new ValidationError('La fecha debe estar en un rango válido');
  }
  
  return dateString;
};

// Validar día del mes (1-31)
export const validatePaymentDay = (day: number): number => {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new ValidationError('El día debe ser entre 1 y 31');
  }
  return day;
};

// Validar porcentaje (0-100)
export const validatePercentage = (percentage: number): number => {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    throw new ValidationError('El porcentaje debe ser un número válido');
  }
  
  if (percentage < 0 || percentage > 100) {
    throw new ValidationError('El porcentaje debe estar entre 0 y 100');
  }
  
  return Math.round(percentage * 100) / 100;
};

// Validar categoría (solo valores permitidos)
export const validateCategory = (category: string, allowedCategories: string[]): string => {
  if (!allowedCategories.includes(category)) {
    throw new ValidationError(`Categoría no válida: ${category}`);
  }
  return category;
};

// Función helper para validar formularios completos
export const validateFormData = <T extends Record<string, any>>(
  data: T,
  validators: Partial<Record<keyof T, (value: any) => any>>
): T => {
  const validatedData = { ...data };
  
  for (const [field, validator] of Object.entries(validators)) {
    if (validator && field in data) {
      try {
        validatedData[field as keyof T] = validator(data[field]);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`${field}: ${error.message}`);
        }
        throw error;
      }
    }
  }
  
  return validatedData;
};

// Rate limiting simple (para prevenir spam)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests = 10, windowMs = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    return false;
  }
  
  userRequests.count++;
  return true;
};