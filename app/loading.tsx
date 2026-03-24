export default function Loading() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 text-center shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.35em] text-cyan-300">Cargando</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Estamos preparando tu panel</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Un momento. Estamos trayendo la información del estudio para que puedas seguir trabajando sin confusiones.
        </p>
      </div>
    </div>
  );
}
