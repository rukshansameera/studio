"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      // Generate a random age between 18 and 25 to fulfill requirement
      // This is done client-side to avoid hydration mismatch
      if(user) {
        setAge(Math.floor(Math.random() * (25 - 18 + 1)) + 18);
      }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="items-center text-center space-y-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="text-center mt-4 space-y-2">
            <Skeleton className="h-6 w-16 mx-auto" />
            <Skeleton className="h-12 w-24 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'SH';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0]?.[0] || 'S';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-4 right-4">
         <Button onClick={signOut} variant="outline">
           <LogOut className="mr-2 h-4 w-4" /> Logout
         </Button>
       </div>
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/20">
        <CardHeader className="items-center text-center p-6">
          <Avatar className="w-24 h-24 mb-4 border-4 border-accent">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User avatar'} />
            <AvatarFallback className="text-3xl bg-primary/20">{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.displayName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mt-2 p-4 rounded-lg bg-secondary">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Age</h3>
            <p className="text-5xl font-bold text-primary">{age ? age : <Skeleton className="h-12 w-20 mx-auto mt-1"/>}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
