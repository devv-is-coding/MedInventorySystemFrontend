'use client';

import { useApp } from '@/context/AppContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}