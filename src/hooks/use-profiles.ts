import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { CRSProfile } from '@shared/types';
import { uuidv4 } from 'uuidv7';
export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage<CRSProfile[]>('maple_metrics_profiles', []);
  const saveProfile = (profile: Omit<CRSProfile, 'id' | 'date'> & { id?: string }) => {
    const now = new Date().toISOString();
    const newProfiles = [...(profiles ?? [])];
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
    setProfiles(newProfiles);
  };
  const deleteProfile = (id: string) => {
    setProfiles((profiles ?? []).filter(p => p.id !== id));
  };
  const latestProfile = useMemo(() => {
    if (!profiles || profiles.length === 0) return null;
    return [...profiles].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [profiles]);
  return {
    profiles: profiles ?? [],
    saveProfile,
    deleteProfile,
    latestProfile
  };
}