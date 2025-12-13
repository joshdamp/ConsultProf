import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (replaces deprecated cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: false,
      refetchOnMount: false, // Only refetch if data is stale
    },
    mutations: {
      retry: 0, // Don't retry failed mutations by default
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
