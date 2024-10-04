"use client";
import { QueryClient, QueryClientProvider } from 'react-query';
import Songs from './Songs';

const queryClient = new QueryClient();

const SongsWrapper = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <Songs isAuthenticated={true} />
    </QueryClientProvider>
  );
};

export default SongsWrapper;