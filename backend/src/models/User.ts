import { Role } from './Role';
import { Ticket } from './Ticket';

export interface User {
  id: number;
  uid: string;           
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roleId: number;
  role?: Role;
  tickets?: Ticket[];
  createdAt?: Date;      
  updatedAt?: Date;     
}
