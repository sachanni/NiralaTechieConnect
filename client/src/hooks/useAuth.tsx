import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  idToken: string;
  setUser: (user: any) => void;
  setIdToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser, initialToken }: { children: ReactNode; initialUser?: any; initialToken?: string }) {
  const [user, setUser] = useState(initialUser || null);
  const [idToken, setIdToken] = useState(initialToken || '');

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (initialToken) setIdToken(initialToken);
  }, [initialToken]);

  return (
    <AuthContext.Provider value={{ user, idToken, setUser, setIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
