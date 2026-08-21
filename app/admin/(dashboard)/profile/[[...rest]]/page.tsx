import { UserProfile } from '@clerk/nextjs';

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          Profile
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Manage your admin account details.</p>
      </div>

      <UserProfile
        appearance={{
          variables: {
            colorPrimary: '#D40000',
            colorBackground: '#141414',
            colorNeutral: '#ffffff',
            borderRadius: '12px',
          },
          elements: {
            card: 'bg-[#141414] border border-white/[0.06] rounded-2xl shadow-none',
            navbar: 'bg-[#111111] border-r border-white/[0.06]',
            navbarButton: 'text-[#9CA3AF] hover:text-white',
            navbarButtonActive: 'text-white bg-white/[0.05]',
            pageScrollBox: 'bg-[#141414]',
            formFieldLabel: 'text-[#D9D9D9]',
            formFieldInput: 'bg-[#1e1e1e] border-white/10 text-white',
            profileSectionTitle: 'text-white',
            profileSectionTitleText: 'text-white',
            profileSectionContent: 'text-[#9CA3AF]',
            accordionTriggerButton: 'text-[#9CA3AF] hover:text-white',
            badge: 'bg-[#D40000]/20 text-[#D40000]',
            breadcrumbsItem: 'text-[#9CA3AF]',
            breadcrumbsItemDivider: 'text-[#9CA3AF]',
          },
        }}
      />
    </div>
  );
}
