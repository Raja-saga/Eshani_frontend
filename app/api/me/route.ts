import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const user = await currentUser();

  return NextResponse.json({
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.emailAddresses[0]?.emailAddress,
    imageUrl: user?.imageUrl,
    createdAt: user?.createdAt,
    // Which provider they used to sign in (google, github, password, etc.)
    authProviders: user?.externalAccounts.map((a) => a.provider),
  });
}
