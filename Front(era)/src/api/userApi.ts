export interface UserProfile {
    id: number;
    username: string;
    fullName: string;
    photo: string;  // base64 o URL
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchProfile(token: string): Promise<UserProfile> {
    const res = await fetch(`http://localhost:8080/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error fetching profile');
    return await res.json();
}

export async function updatePhoto(photo: string, token: string) {
    const res = await fetch(`${BASE}/api/users/me/photo`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ photoBase64: photo })
    });
    if (!res.ok) throw new Error('Error updating photo');
    return res.json() as Promise<UserProfile>;
}

export async function deleteAccount(token: string) {
    const res = await fetch(`${BASE}/api/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error deleting account');
}

export async function fetchMyRecipes(token: string) {
    const res = await fetch(`${BASE}/api/users/me/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error fetching my recipes');
    return res.json();
}

export async function updateProfile(username: string, password: string, photo: string, token: string): Promise<void> {
    const res = await fetch(`http://localhost:8080/api/users/me/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, photo })
    });

    if (!res.ok) {
        throw new Error('Error updating profile');
    }
}
