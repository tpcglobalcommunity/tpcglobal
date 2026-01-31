import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { isValidAdmin } from "@/config/admin";
import { 
  initializeAuthManager, 
  getCurrentUser, 
  getCurrentSession, 
  isAuthenticated,
  signOutSafe,
  onSessionChange,
  refreshSessionIfNeeded
} from "./auth/session";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.info('[AUTH-HARDEN] AuthProvider initializing...');
    
    // Initialize auth manager
    const subscription = initializeAuthManager();
    
    // Get initial state
    const currentUser = getCurrentUser();
    const currentSession = getCurrentSession();
    const isAuthed = isAuthenticated();
    
    setUser(currentUser);
    setSession(currentSession);
    setIsAdmin(isValidAdmin(currentUser?.id));
    setLoading(false);
    
    // Subscribe to session changes
    const unsubscribe = onSessionChange((newSession) => {
      console.info('[AUTH-HARDEN] AuthProvider session updated');
      setUser(newSession?.user ?? null);
      setSession(newSession);
      setIsAdmin(isValidAdmin(newSession?.user?.id));
    });
    
    // Cleanup
    return () => {
      subscription?.unsubscribe();
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    const success = await signOutSafe();
    if (success) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const refreshSession = async () => {
    const success = await refreshSessionIfNeeded();
    if (success) {
      const currentUser = getCurrentUser();
      const currentSession = getCurrentSession();
      setUser(currentUser);
      setSession(currentSession);
      setIsAdmin(isValidAdmin(currentUser?.id));
    }
    return success;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
