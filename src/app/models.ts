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

export interface Incidence{
    id: string; 
    user_uid: string; 
    title: string;
    description: string; 
    status: 'open' | 'resolved';
    createdAt: Date;
    resolvedAt?: Date;
    priority: number;
}

export interface Vehicle {
    model: string;
    licensePlate: string;
    isFourByFour: boolean;
    needsFuel: boolean;
    needsRepair: boolean;
  }