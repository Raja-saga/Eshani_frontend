import { Radio, Plus } from 'lucide-react';

export default function AdminReleasesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Releases
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Schedule and manage your upcoming releases.
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000]/60 text-white text-sm font-semibold cursor-not-allowed opacity-60"
        >
          <Plus className="w-4 h-4" />
          Schedule Release
        </button>
      </div>

      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
        <Radio className="w-10 h-10 text-[#9CA3AF]" aria-hidden="true" />
        <p className="text-white font-semibold">No scheduled releases</p>
        <p className="text-[#9CA3AF] text-sm max-w-xs">
          Plan drop dates and coordinate releases from here.
        </p>
      </div>
    </div>
  );
}
