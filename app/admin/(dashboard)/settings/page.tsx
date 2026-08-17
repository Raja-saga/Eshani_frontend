import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          Settings
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Platform and account configuration.</p>
      </div>

      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
        <Settings className="w-10 h-10 text-[#9CA3AF]" aria-hidden="true" />
        <p className="text-white font-semibold">Settings</p>
        <p className="text-[#9CA3AF] text-sm max-w-xs">
          Platform settings will be available here in a future update.
        </p>
      </div>
    </div>
  );
}
