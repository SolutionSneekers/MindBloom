'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error logging out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return { handleLogout };
}
