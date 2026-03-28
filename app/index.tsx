import { Redirect } from 'expo-router';
import { useApp } from '@/hooks/useApp';

export default function Index() {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/login" />;
}
