'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

export default function WhoIsLoggedIn() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="p-4 text-sm text-muted-foreground">Loading auth...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card text-sm">
        <p className="font-semibold text-destructive">❌ No one is logged in</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-green-500 bg-card text-sm space-y-2">
      <p className="font-bold text-green-500">✅ Logged in</p>
      <div className="flex items-center gap-3">
        {user.imageUrl && (
          <Image src={user.imageUrl} alt="avatar" width={40} height={40} className="rounded-full" />
        )}
        <div>
          <p className="font-semibold">{user.fullName ?? '(no name)'}</p>
          <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
      <p>
        <span className="font-medium">User ID:</span>{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{user.id}</code>
      </p>
      <p>
        <span className="font-medium">Signed in via:</span>{' '}
        {user.externalAccounts.length > 0
          ? user.externalAccounts.map((a) => a.provider).join(', ')
          : 'Email / Password'}
      </p>
    </div>
  );
}
