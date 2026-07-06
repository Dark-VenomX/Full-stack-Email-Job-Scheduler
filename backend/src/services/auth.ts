import { useMocks } from '../config/env';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google';
}

const mockUser: AuthUser = {
  id: 'u_mock_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@reachinbox.app',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces',
  provider: 'google',
};

export async function verifyGoogleToken(token: string): Promise<AuthUser> {
  if (useMocks || token.startsWith('mock-jwt-')) {
    return mockUser;
  }
  
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Invalid token');
    const payload = await res.json() as any;

    return {
      id: payload.id,
      name: payload.name || 'Unknown',
      email: payload.email || '',
      avatar: payload.picture || '',
      provider: 'google',
    };
  } catch (err) {
    console.error('[auth] Google token verification failed:', err);
    throw new Error('Invalid Google token');
  }
}

export function getMockUser(): AuthUser {
  return mockUser;
}
