export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
      <p className="text-[10px] uppercase tracking-wider font-bold text-luxury-gold">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
  );
}
