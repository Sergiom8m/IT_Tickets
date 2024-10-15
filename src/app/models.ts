export interface User {
    uid: string;
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    telephone: string;
    code: string;
    department: string;
    role: 'admin' | 'user';
}

export interface Ticket{
    id: string; 
    user_uid: string; 
    title: string;
    description: string; 
    status: 'open' | 'in-progress' | 'resolved';
    createdAt: Date;
    resolvedAt?: Date;
    priority: 'low' | 'medium' | 'high';
}