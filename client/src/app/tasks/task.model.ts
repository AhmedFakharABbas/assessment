export interface Task {
    id: number;
    name: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Completed';
    created_by: number;
    created_at: string;
    updated_at: string;
    latitude?: number;
    longitude?: number;
  }
  