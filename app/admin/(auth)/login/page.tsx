import { auth } from '@clerk/nextjs/server';
import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'iconButton' as const,
  },
  variables: {
    colorPrimary: '#D40000',
    colorBackground: '#111111',
    colorInputBackground: '#1a1a1a',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#9CA3AF',
    colorTextOnPrimaryBackground: '#ffffff',
    colorNeutral: '#ffffff',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: 'bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl',
    headerTitle: 'text-white font-bold',
    headerSubtitle: 'text-[#9CA3AF]',
    socialButtonsBlockButton:
      'bg-[#1a1a1a] border-[rgba(255,255,255,0.1)] text-white hover:bg-[#222] transition-colors',
    formButtonPrimary:
      'bg-[#D40000] hover:bg-[#8B1111] text-white font-semibold transition-all duration-200',
    formFieldInput:
      'bg-[#1a1a1a] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000]',
    formFieldLabel: 'text-[#D9D9D9] font-medium',
    identityPreviewText: 'text-white',
    identityPreviewEditButton: 'text-[#D40000]',
    footerActionLink: 'text-[#D40000] hover:text-[#ff4444]',
    dividerLine: 'bg-[rgba(255,255,255,0.08)]',
    dividerText: 'text-[#9CA3AF]',
    alternativeMethodsBlockButton:
      'border-[rgba(255,255,255,0.1)] text-[#D9D9D9] hover:bg-[rgba(255,255,255,0.05)]',
  },
};

export default async function AdminLoginPage() {
  const { userId, sessionClaims } = await auth();

  // Already signed in as admin → go straight to the dashboard
  if (userId && sessionClaims?.metadata?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D40000]">
          Admin Access
        </p>
        <h1
          className="text-3xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          ESH<span className="text-[#D40000]">ANI</span>
        </h1>
      </div>

      <SignIn
        appearance={clerkAppearance}
        forceRedirectUrl="/admin"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
