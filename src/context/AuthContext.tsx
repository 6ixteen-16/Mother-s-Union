"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AdminRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  role: AdminRole | null;
  needsPasswordReset: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  needsPasswordReset: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        unsubscribeDoc = onSnapshot(
          doc(db, "admins", firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setRole(data.role as AdminRole);
              setNeedsPasswordReset(!!data.needsPasswordReset);
            } else {
              setRole(null);
              setNeedsPasswordReset(false);
            }
            setLoading(false);
          },
          (error) => {
            console.error("AuthContext snapshot error:", error);
            setRole(null);
            setNeedsPasswordReset(false);
            setLoading(false);
          }
        );
      } else {
        setRole(null);
        setNeedsPasswordReset(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, needsPasswordReset, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
