'use client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { createContext, useContext, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { auth, dataClient } from '@/lib/api';
import type { User, RecordData } from '@/schemas';
const SessionContext = createContext<{
  user?: User;
  siteId: string;
  setSiteId: (id: string) => void;
  sites: RecordData[];
  loading: boolean;
  online: boolean;
}>({ siteId: '', setSiteId: () => {}, sites: [], loading: true, online: true });
export const useSession = () => useContext(SessionContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [query] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30000, retry: 1 }, mutations: { retry: 0 } },
      }),
  );
  return (
    <QueryClientProvider client={query}>
      <NuqsAdapter>
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-center" richColors closeButton />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useQuery({ queryKey: ['session'], queryFn: auth.me, retry: false });
  const sites = useQuery({
    queryKey: ['sites', session.data?.id],
    queryFn: () => dataClient.list('sites'),
    enabled: !!session.data,
  });
  const [selected, setSelected] = useState('');
  const [online, setOnline] = useState(true);
  useEffect(() => {
    try {
      setSelected(localStorage.getItem(`civil.scope.v1.${session.data?.id}`) || '');
    } catch {}
  }, [session.data?.id]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  const siteId = sites.data?.some((s) => s.id === selected) ? selected : sites.data?.[0]?.id || '';
  const setSiteId = (id: string) => {
    setSelected(id);
    try {
      localStorage.setItem(`civil.scope.v1.${session.data?.id}`, id);
    } catch {}
  };
  return (
    <SessionContext.Provider
      value={{
        user: session.data,
        siteId,
        setSiteId,
        sites: sites.data || [],
        loading: session.isLoading,
        online,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
