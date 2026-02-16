"use client";

import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  uid: string;
  email: string | null;
  role: string;
  name: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [auth, db] = await Promise.all([
        getFirebaseAuth(),
        getFirebaseDb(),
      ]);
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: data.role || "anggota",
                name: data.name || "User",
              });
            } else {
              console.error("User document not found");
              setUser(null);
              await auth.signOut();
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const logout = async () => {
    const auth = await getFirebaseAuth();
    await auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
