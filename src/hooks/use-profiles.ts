import { useMemo, useState, useEffect, useCallback } from 'react';
import { CRSProfile } from '@shared/types';
const STORAGE_KEY = 'maple_metrics_profiles';
export function useProfiles() {
  // Initialize state from LocalStorage using a lazy initializer
  const [profiles, setProfiles] = useState<CRSProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("[PROFILES HOOK] Failed to load profiles:", e);
      return [];
    }
  });
  // Persist to LocalStorage whenever profiles change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error("[PROFILES HOOK] Failed to persist profiles:", e);
    }
  }, [profiles]);
  const saveProfile = useCallback((profile: Omit<CRSProfile, 'id' | 'date'> & { id?: string }) => {
    const now = new Date().toISOString();
    setProfiles((prev) => {
      const newProfiles = [...prev];
      if (profile.id) {
        const index = newProfiles.findIndex(p => p.id === profile.id);
        if (index !== -1) {
          newProfiles[index] = { ...newProfiles[index], ...profile, date: now } as CRSProfile;
        } else {
          newProfiles.push({ ...profile, id: profile.id, date: now } as CRSProfile);
        }
      } else {
        newProfiles.push({
          ...profile,
          id: crypto.randomUUID(),
          date: now
        } as CRSProfile);
      }
      return newProfiles;
    });
  }, []);
  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter(p => p.id !== id));
  }, []);
  const latestProfile = useMemo(() => {
    if (!profiles || profiles.length === 0) return null;
    return [...profiles].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [profiles]);
  return {
    profiles,
    saveProfile,
    deleteProfile,
    latestProfile
  };
}