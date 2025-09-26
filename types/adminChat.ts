export interface AdminEntity { id: string; email: string; name: string | null; role: 'ADMIN' | 'SUPERADMIN'; status: string; }
export interface UserEntity { id: string; email: string; name: string | null; }
export interface ChatMessage { id: string; userId: string; adminId?: string | null; message: string; who: string; createdAt: string; }
