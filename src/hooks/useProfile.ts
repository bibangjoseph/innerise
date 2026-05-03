import { useCallback, useEffect, useState } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { db } from '../lib/firebase';
import type { Profile, Scores } from '../types';

interface UserData {
  profile: Profile;
  streak: number;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function buildDefaultProfile(user: User): Profile {
  const firstName = user.displayName?.split(' ')[0] ?? 'toi';
  return {
    init: getInitials(user.displayName),
    name: user.displayName ?? 'Utilisateur',
    photoURL: user.photoURL ?? undefined,
    level: 'En transition',
    lvlBg: 'var(--purple-lt)',
    lvlCl: 'var(--purple-dk)',
    domain: '',
    situation: '',
    day: 1,
    scores: { clarte: 5, resil: 5, motiv: 5, ancr: 5 },
    memory: [],
    q1: `Bonjour ${firstName}. Comment tu te sens aujourd'hui ?`,
    qrs1: ['Bien, je suis motivé·e', 'Ça va moyen', "C'est difficile"],
    fu: {
      pos: { q: "Super. Qu'est-ce qui te donne le plus d'énergie en ce moment ?", qrs: ['Mon travail', 'Mes relations', 'Ma pratique personnelle'] },
      neg: { q: "Je comprends. Qu'est-ce qui pèse le plus en ce moment ?", qrs: ['Le travail', 'Les relations', 'Moi-même'] },
      hard: { q: "Je suis là. Qu'est-ce qui rend les choses difficiles ?", qrs: ['La pression', 'Le doute', 'La fatigue'] },
    },
  };
}

const EMPTY_PROFILE: Profile = {
  init: '…', name: '', level: '', lvlBg: '', lvlCl: '',
  domain: '', situation: '', day: 0,
  scores: { clarte: 5, resil: 5, motiv: 5, ancr: 5 },
  memory: [], q1: '', qrs1: [],
  fu: { pos: { q: '', qrs: [] }, neg: { q: '', qrs: [] }, hard: { q: '', qrs: [] } },
};

export function useProfile(user: User | null) {
  const [userData, setUserData] = useState<UserData>({
    profile: EMPTY_PROFILE,
    streak: 0,
  });

  // Load user data from Firestore on login
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Always sync name, photo and welcome message from Google in case they changed
        const firstName = user.displayName?.split(' ')[0] ?? 'toi';
        const profile: Profile = {
          ...data.profile,
          name: user.displayName ?? data.profile.name,
          photoURL: user.photoURL ?? data.profile.photoURL,
          init: getInitials(user.displayName) || data.profile.init,
          q1: `Bonjour ${firstName}. Comment tu te sens aujourd'hui ?`,
        };
        setUserData({ profile, streak: data.streak ?? data.profile.day });
        updateDoc(ref, {
          'profile.name': profile.name,
          'profile.photoURL': profile.photoURL,
          'profile.init': profile.init,
          'profile.q1': profile.q1,
        });
      } else {
        // First login: build profile from Google account
        const profile = buildDefaultProfile(user);
        setDoc(ref, { profile, streak: 1, createdAt: serverTimestamp() });
        setUserData({ profile, streak: 1 });
      }
    });
  }, [user]);

  const saveProfile = useCallback(async (profile: Profile, streak: number) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { profile, streak });
    setUserData({ profile, streak });
  }, [user]);

  const addMemory = useCallback(async (entry: string) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const updated = { ...userData.profile, memory: [entry, ...userData.profile.memory] };
    await updateDoc(ref, { profile: updated });
    setUserData((prev) => ({ ...prev, profile: updated }));

    // Also push to checkins subcollection
    const checkinsRef = doc(db, 'users', user.uid, 'checkins', new Date().toISOString());
    await setDoc(checkinsRef, { entry, ts: serverTimestamp() });
  }, [user, userData.profile]);

  const updateScores = useCallback(async (scores: Scores) => {
    if (!user) return;
    const updated = { ...userData.profile, scores };
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { profile: updated });
    setUserData((prev) => ({ ...prev, profile: updated }));
  }, [user, userData.profile]);

  const incrementStreak = useCallback(async () => {
    if (!user) return;
    const newStreak = userData.streak + 1;
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { streak: newStreak });
    setUserData((prev) => ({ ...prev, streak: newStreak }));
  }, [user, userData.streak]);

  const saveCheckIn = useCallback(async (answers: string[]) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'checkins', new Date().toISOString().split('T')[0]);
    await setDoc(ref, { answers, ts: serverTimestamp() });
  }, [user]);

  const saveDiagnostic = useCallback(async (data: object) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'diagnostics', new Date().toISOString());
    await setDoc(ref, { ...data, ts: serverTimestamp() });
    // Append new memory from diagnostic
    const newMem = (data as { nouvelle_memoire?: string }).nouvelle_memoire;
    if (newMem) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 'profile.memory': arrayUnion(newMem) });
    }
  }, [user]);

  return {
    profile: userData.profile,
    streak: userData.streak,
    saveProfile,
    addMemory,
    updateScores,
    incrementStreak,
    saveCheckIn,
    saveDiagnostic,
  };
}
