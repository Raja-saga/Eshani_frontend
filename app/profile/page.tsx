import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full max-w-3xl',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
