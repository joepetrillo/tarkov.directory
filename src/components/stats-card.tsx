export default function StatsCard({
  stats,
}: {
  stats: {
    recoilVertical: number;
    recoilHorizontal: number;
    ergonomics: number;
  };
}) {
  return (
    <div className="max-w-[250px] border border-eft-tan/30 bg-gradient-to-b from-stone-900/70 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <span>Vertical Recoil</span>
          <span className="font-bold">{stats.recoilVertical}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Horizontal Recoil</span>
          <span className="font-bold">{stats.recoilHorizontal}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Ergonomics</span>
          <span className="font-bold">{stats.ergonomics}</span>
        </div>
      </div>
    </div>
  );
}
