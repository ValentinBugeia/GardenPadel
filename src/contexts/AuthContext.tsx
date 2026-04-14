import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type PadelLevel = "Débutant" | "P25" | "P50" | "P100" | "P250" | "P500" | "P1000+";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  birthDate: string;
  level: PadelLevel;
  role: "admin" | "user";
  createdAt: string;
  credits: number;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  birthDate: string;
  level: PadelLevel;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  isRecovering: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Pick<User, "firstName" | "lastName" | "email" | "address" | "birthDate" | "level" | "credits">>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

// Convertit une ligne DB en User
const toUser = (row: Record<string, unknown>): User => ({
  id:         row.id as string,
  firstName:  (row.first_name as string) || "",
  lastName:   (row.last_name as string)  || "",
  email:      (row.email as string)      || "",
  address:    (row.address as string)    || "",
  birthDate:  (row.birth_date as string) || "",
  level:      ((row.level as PadelLevel) || "Débutant"),
  role:       ((row.role as "admin" | "user") || "user"),
  createdAt:  (row.created_at as string) || new Date().toISOString(),
  credits:    typeof row.credits === "number" ? row.credits : 5,
});

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);

  // ── Chargement de tous les membres ──────────────────────────
  const refreshUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) setUsers(data.map(toUser));
  };

  // ── Chargement du profil courant ────────────────────────────
  const loadCurrentUser = async (userId: string): Promise<User | null> => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!data) return null;
    const u = toUser(data);
    setUser(u);
    return u;
  };

  // ── Initialisation de la session ────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session?.user) await loadCurrentUser(session.user.id);
        await refreshUsers();
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (_event === "PASSWORD_RECOVERY") {
        setIsRecovering(true);
        return;
      }
      if (session?.user) {
        loadCurrentUser(session.user.id).then(() => refreshUsers()).catch(() => {});
      } else {
        setUser(null);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  // ── Connexion ───────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data: banned } = await supabase.from("banned_emails").select("email").eq("email", email).maybeSingle();
    if (banned) return { success: false, error: "Ce compte a été suspendu. Contactez le club." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: "Identifiants incorrects." };
    return { success: true };
  };

  // ── Inscription ─────────────────────────────────────────────
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name:  data.lastName,
          address:    data.address,
          birth_date: data.birthDate,
          level:      data.level,
          role:       "user",
          credits:    0,
        },
      },
    });
    if (error) {
      if (error.message.includes("already registered")) return { success: false, error: "Cet email est déjà utilisé." };
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // ── Réinitialisation mot de passe ───────────────────────────
  const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    setIsRecovering(false);
    return { success: true };
  };

  // ── Déconnexion ──────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Mise à jour du profil ────────────────────────────────────
  const updateUser = async (
    data: Partial<Pick<User, "firstName" | "lastName" | "email" | "address" | "birthDate" | "level" | "credits">>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Non connecté." };

    const updates: Record<string, unknown> = {};
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName  !== undefined) updates.last_name  = data.lastName;
    if (data.email     !== undefined) updates.email      = data.email;
    if (data.address   !== undefined) updates.address    = data.address;
    if (data.birthDate !== undefined) updates.birth_date = data.birthDate;
    if (data.level     !== undefined) updates.level      = data.level;
    if (data.credits   !== undefined) updates.credits    = data.credits;

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) return { success: false, error: error.message };

    setUser(prev => prev ? { ...prev, ...data } : null);
    await refreshUsers();
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, loading, isRecovering, login, register, logout, updateUser, resetPassword, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};
