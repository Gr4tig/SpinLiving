
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Définition des types pour les informations utilisateur
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'proprietaire' | 'locataire';
  createdAt: string;
}

// Comptes de test prédéfinis
export const TEST_USER_OWNER: UserInfo = {
  id: '1',
  name: 'Chris Evans',
  email: 'test@spinliving.fr',
  phone: '0666666668',
  accountType: 'proprietaire',
  createdAt: '2023-12-15',
};

export const TEST_USER_TENANT: UserInfo = {
  id: '2',
  name: 'Sophie Martin',
  email: 'locataire@spinliving.fr',
  phone: '0677889900',
  accountType: 'locataire',
  createdAt: '2024-01-10',
};

// État initial de l'authentification
interface AuthState {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthState | undefined>(undefined);

// Provider du contexte d'authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Vérifier si l'utilisateur était déjà connecté (via localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    // Vérifier les informations de connexion
    if (email === TEST_USER_OWNER.email && password === 'spinliving123') {
      setUserInfo(TEST_USER_OWNER);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(TEST_USER_OWNER));
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${TEST_USER_OWNER.name}!`,
      });
      
      return true;
    } else if (email === TEST_USER_TENANT.email && password === 'locataire123') {
      setUserInfo(TEST_USER_TENANT);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(TEST_USER_TENANT));
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${TEST_USER_TENANT.name}!`,
      });
      
      return true;
    } else {
      toast({
        title: 'Échec de la connexion',
        description: 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('user');
    
    toast({
      title: 'Déconnexion réussie',
      description: 'Vous avez été déconnecté avec succès.',
    });
    
    navigate('/');
  };

  // Fournir le contexte d'authentification
  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
