import { Local } from './order';

export type UserRole = 'admin' | 'local';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  local?: Local;
  name: string;
}

export const mockUsers: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
  },
  {
    id: 'user-local1',
    username: 'local1',
    password: 'local1',
    role: 'local',
    local: 'Local 1',
    name: 'Local 1',
  },
  {
    id: 'user-local2',
    username: 'local2',
    password: 'local2',
    role: 'local',
    local: 'Local 2',
    name: 'Local 2',
  },
  {
    id: 'user-local3',
    username: 'local3',
    password: 'local3',
    role: 'local',
    local: 'Local 3',
    name: 'Local 3',
  },
  {
    id: 'user-local4',
    username: 'local4',
    password: 'local4',
    role: 'local',
    local: 'Local 4',
    name: 'Local 4',
  },
  {
    id: 'user-local5',
    username: 'local5',
    password: 'local5',
    role: 'local',
    local: 'Local 5',
    name: 'Local 5',
  },
];
