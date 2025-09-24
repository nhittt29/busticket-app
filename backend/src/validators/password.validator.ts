import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (typeof password !== 'string') return false;

    // 1. Độ dài >= 12
    if (password.length < 12) return false;

    // 2. Chữ cái đầu viết hoa
    if (password[0] !== password[0].toUpperCase()) return false;

    // 3. Ít nhất 1 ký tự đặc biệt
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) return false;

    return true;
  }

  defaultMessage() {
    return 'Password phải ≥12 ký tự, chữ cái đầu viết hoa và có ít nhất 1 ký tự đặc biệt';
  }
}

// Decorator để sử dụng trong DTO
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
