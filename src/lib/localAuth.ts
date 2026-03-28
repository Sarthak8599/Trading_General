export interface LocalUser {
  id: string;
  email: string;
  name: string;
  isDemo?: boolean;
}

export class LocalAuthService {
  private static readonly DEMO_USERS: LocalUser[] = [
    { 
      id: 'demo-1', 
      email: 'test@demo.com', 
      name: 'Demo User',
      isDemo: true 
    },
    { 
      id: 'demo-2', 
      email: 'trader@demo.com', 
      name: 'Trader Demo',
      isDemo: true 
    },
    { 
      id: 'demo-3', 
      email: 'user@test.com', 
      name: 'Test User',
      isDemo: true 
    }
  ];

  static async signIn(email: string, password: string): Promise<{ user: LocalUser | null; error: any }> {
    // Simple password check for demo accounts
    const user = this.DEMO_USERS.find(u => u.email === email);
    
    if (user && (password === 'demo123' || password === 'test123' || password === 'trader123')) {
      // Store in localStorage
      localStorage.setItem('localAuthUser', JSON.stringify(user));
      localStorage.setItem('localAuth', 'true');
      return { user, error: null };
    }
    
    return { 
      user: null, 
      error: { message: 'Invalid demo credentials. Use test@demo.com / demo123' } 
    };
  }

  static getCurrentUser(): LocalUser | null {
    try {
      const userStr = localStorage.getItem('localAuthUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static signOut(): void {
    localStorage.removeItem('localAuthUser');
    localStorage.removeItem('localAuth');
  }

  static isLocalAuth(): boolean {
    return localStorage.getItem('localAuth') === 'true';
  }

  static getAllDemoUsers(): LocalUser[] {
    return this.DEMO_USERS;
  }
}
