// Helper function to get admin auth token
export function getAdminAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const profile = localStorage.getItem('ayuraProfile');
    if (!profile) {
        return null;
    }
    
    try {
        const data = JSON.parse(profile);
        
        // Check if user is admin first
        if (data.role !== 'admin') {
            return null;
        }
        
        // Return the correct user ID (could be userId or id)
        const token = data.userId || data.id || null;
        return token;
    } catch (error) {
        return null;
    }
}

// Helper function to create authenticated headers
export function createAuthHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}
