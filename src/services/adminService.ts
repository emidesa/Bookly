import type { AdminStats, AdminUser } from '../types/admin';
import { api } from './api';

// Routes réservées aux admins (403 pour un lecteur)
export function getUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>('/admin/users');
}

// Ses livres et ses sessions sont supprimés en cascade
export function deleteUser(id: number): Promise<{ message: string }> {
  return api.delete<{ message: string }>('/admin/users/' + id);
}

export function getAdminStats(): Promise<AdminStats> {
  return api.get<AdminStats>('/admin/stats');
}
