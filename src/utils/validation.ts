export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  value: number | null;
  isBlank: boolean;
}

export function validateMarks(input: string | number | null | undefined, maxMarks: number): ValidationResult {
  if (input === null || input === undefined || input === '') {
    return {
      isValid: true,
      error: null,
      value: null,
      isBlank: true,
    };
  }

  const strInput = String(input).trim();
  if (strInput === '') {
    return {
      isValid: true,
      error: null,
      value: null,
      isBlank: true,
    };
  }

  const num = Number(strInput);
  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Enter a valid number',
      value: null,
      isBlank: false,
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      error: 'Marks cannot be negative',
      value: null,
      isBlank: false,
    };
  }

  if (num > maxMarks) {
    return {
      isValid: false,
      error: `Marks cannot exceed ${maxMarks}.`,
      value: null,
      isBlank: false,
    };
  }

  return {
    isValid: true,
    error: null,
    value: num,
    isBlank: false,
  };
}
