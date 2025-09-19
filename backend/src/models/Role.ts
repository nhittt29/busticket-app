export enum RoleName {
  ADMIN = 'ADMIN',
  PASSENGER = 'PASSENGER',
}

export interface Role {
  id: number;
  name: RoleName;
}
