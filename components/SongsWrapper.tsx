"use client";
import { QueryClient, QueryClientProvider } from 'react-query';
import Songs from './Songs';

const queryClient = new QueryClient();

const SongsWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Songs />
    </QueryClientProvider>
  );
};

export default SongsWrapper;