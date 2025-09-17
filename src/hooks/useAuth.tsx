import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * @interface AuthContextType
 * @property {User | null} user - The authenticated user object, or null if not authenticated.
 * @property {Session | null} session - The current session object, or null if there is no session.
 * @property {any} profile - The user's profile data from the database.
 * @property {boolean} loading - True if the authentication state is currently being loaded.
 * @property {(email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>} signUp - Function to sign up a new user.
 * @property {(email: string, password: string) => Promise<{ error: any }>} signIn - Function to sign in a user.
 * @property {() => Promise<{ error: any }>} signOut - Function to sign out the current user.
 * @property {boolean} isAdmin - True if the current user has the 'super_admin' role.
 * @property {boolean} isRestaurantOwner - True if the current user has the 'restaurant_owner' role.
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  isRestaurantOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * A component that provides authentication context to its children.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The rendered authentication provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setProfile(profileData);
        }, 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role = "restaurant_owner"
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      toast.error(
        error.message === "User already registered"
          ? "المستخدم مسجل بالفعل"
          : "حدث خطأ أثناء التسجيل"
      );
    } else {
      toast.success("تم التسجيل بنجاح - تحقق من بريدك الإلكتروني لتأكيد الحساب");
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "بيانات الدخول غير صحيحة"
          : "حدث خطأ أثناء تسجيل الدخول"
      );
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
    return { error };
  };

  const isAdmin = profile?.role === "super_admin";
  const isRestaurantOwner = profile?.role === "restaurant_owner";

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isRestaurantOwner,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * A custom hook for accessing the authentication context.
 * @returns {AuthContextType} The authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}