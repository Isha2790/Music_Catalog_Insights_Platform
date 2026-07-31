'use client';

export default function VinylRecord({ size = 64, spinning = true, artworkUrl = null }) {
  const dim = size;
  return (
    <div
      className={`relative rounded-full ${spinning ? 'animate-spin-slow' : ''}`}
      style={{ width: dim, height: dim }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#232130] to-[#0d0c14] shadow-[0_0_30px_-6px_rgba(124,92,255,0.5)]" />
      {/* grooves */}
      <div className="absolute inset-[8%] rounded-full border border-white/5" />
      <div className="absolute inset-[16%] rounded-full border border-white/5" />
      <div className="absolute inset-[24%] rounded-full border border-white/5" />
      {/* label */}
      <div
        className="absolute inset-[32%] rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet to-amber"
        style={{
          backgroundImage: artworkUrl ? `url(${artworkUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!artworkUrl && <div className="w-[20%] h-[20%] rounded-full bg-void" />}
      </div>
      {/* center spindle hole */}
      <div className="absolute inset-[46%] rounded-full bg-void border border-white/10" />
    </div>
  );
}
