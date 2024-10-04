"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Songs from './Songs';

interface SongsWrapperProps {
  isAuthenticated: boolean;
}

const queryClient = new QueryClient();

const SongsWrapper: React.FC<SongsWrapperProps> = ({ isAuthenticated }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Songs isAuthenticated={isAuthenticated} />
    </QueryClientProvider>
  );
};

export default SongsWrapper;