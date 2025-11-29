import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User as AppUser } from '../types/user';

export const authService = {
  // Register new user
  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      // Create auth user
      const credential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(credential.user, {
        displayName,
      });

      // Create user document in Firestore
      const userDoc = {
        email,
        displayName,
        preferences: {
          currency: 'THB',
          dateFormat: 'DD/MM/YYYY',
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            weekly_summary: true,
          },
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      };

      await setDoc(doc(db, 'users', credential.user.uid), userDoc);

      console.log('✅ User registered successfully:', displayName);
      return credential.user;
    } catch (error: any) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Update last login time
      await setDoc(
        doc(db, 'users', credential.user.uid),
        { lastLoginAt: Timestamp.now() },
        { merge: true }
      );

      console.log('✅ User logged in successfully:', credential.user.email);
      return credential.user;
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ User logged out successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error.message);
      throw error;
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message);
      throw error;
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: user.photoURL || undefined,
        preferences: data.preferences,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
      } as AppUser;
    } catch (error: any) {
      console.error('❌ Error fetching user data:', error.message);
      return null;
    }
  },

  // Get readable error message
  getErrorMessage(error: any): string {
    const code = error.code || '';
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  },
};
