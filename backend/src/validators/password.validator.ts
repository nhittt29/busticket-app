import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (typeof password !== 'string' || password.trim() === '') return false;

    // 1. Độ dài >= 8
    if (password.length < 8) return false;

    // 2. Có ít nhất 1 chữ in hoa
    const hasUppercase = /[A-Z]/.test(password);
    if (!hasUppercase) return false;

    // 3. Có ít nhất 1 ký tự đặc biệt (bất kỳ ký tự nào KHÔNG phải chữ hoặc số)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    if (!hasSpecialChar) return false;

    return true;
  }

  defaultMessage() {
    return 'Password phải ≥8 ký tự, có ít nhất 1 chữ in hoa và 1 ký tự đặc biệt';
  }
}

// Decorator để dùng trong DTO
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordConstraint,
    });
  };
}
