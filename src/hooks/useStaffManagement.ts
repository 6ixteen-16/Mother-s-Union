"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { AdminUser } from "@/lib/types";

// Firebase config read once for the secondary-app trick below.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function useStaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "admins"));
      setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminUser)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Creates a new admin account WITHOUT signing the super admin out.
   *
   * Firebase's client SDK signs in as the newly created user by default,
   * which would kick the super admin out of their own session. We avoid
   * this by spinning up a temporary, isolated secondary Firebase App
   * instance purely for the createUser call, then tearing it down. The
   * super admin's primary session (on the default app) is never touched.
   *
   * NOTE: this is a client-side workaround appropriate for a small
   * Spark-tier project. For a larger deployment, account creation should
   * move server-side (e.g. a Cloud Function using the Admin SDK) once
   * the project upgrades to the Blaze plan.
   */
  async function addStaffMember(email: string, tempPassword: string) {
    const secondaryApp = initializeApp(firebaseConfig, `staff-create-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        tempPassword
      );
      await setDoc(doc(db, "admins", cred.user.uid), {
        email,
        role: "admin",
        createdAt: Date.now(),
        lastLogin: null,
        createdBy: user?.email || "unknown",
        needsPasswordReset: true,
      });
    } finally {
      await deleteApp(secondaryApp);
    }
    await reload();
  }

  async function revokeStaffMember(adminId: string) {
    // Instead of deleting the doc, we set the role to "revoked".
    // This allows the superadmin to unrevoke them later, while
    // firestore.rules strictly denies access to revoked users.
    await updateDoc(doc(db, "admins", adminId), { role: "revoked" });
    await reload();
  }

  async function unrevokeStaffMember(adminId: string) {
    await updateDoc(doc(db, "admins", adminId), { role: "admin" });
    await reload();
  }

  return { staff, loading, addStaffMember, revokeStaffMember, unrevokeStaffMember, reload };
}
