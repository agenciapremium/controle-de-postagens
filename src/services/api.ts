
export interface DashboardStats {
    critical: number;
    attention: number;
    onTime: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return zeroed stats on error for now to prevent UI crash
        return { critical: 0, attention: 0, onTime: 0 };
    }
};

export interface Client {
    id: string;
    name: string;
    contact_info?: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export const fetchClients = async (): Promise<Client[]> => {
    const response = await fetch('/api/clients');
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
};

export const createClient = async (data: { name: string; contact_info?: string }): Promise<Client> => {
    const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
};

export interface Scope {
    id: string;
    client_id: string;
    material_type: string;
    quantity_per_week: number;
    posting_days: string[];
}

export const fetchScopes = async (clientId: string): Promise<Scope[]> => {
    const response = await fetch(`/api/scopes?clientId=${clientId}`);
    if (!response.ok) throw new Error('Failed to fetch scopes');
    return response.json();
};

export const createScope = async (clientId: string, data: Omit<Scope, 'id' | 'client_id'>): Promise<Scope> => {
    const response = await fetch(`/api/scopes?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create scope');
    return response.json();
};

export const deleteScope = async (id: string): Promise<void> => {
    const response = await fetch(`/api/scopes?id=${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete scope');
};

export interface Post {
    id: string;
    client_id: string;
    content_type: string;
    date: string;
    status: 'pending' | 'late' | 'posted';
    link?: string;
    notes?: string;
}

export const fetchPosts = async (clientId?: string): Promise<Post[]> => {
    const url = clientId ? `/api/posts?clientId=${clientId}` : '/api/posts';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
};

export const createPost = async (data: any): Promise<Post> => {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
};

export const updatePost = async (data: { id: string, status: string, link?: string }): Promise<Post> => {
    const response = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
};
