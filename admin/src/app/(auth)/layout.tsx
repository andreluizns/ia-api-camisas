export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — decorativo */}
      <div
        className="stadium-pattern relative hidden flex-col justify-between p-12 lg:flex lg:w-[45%]"
        style={{ backgroundColor: "#0a1e0f" }}
      >
        {/* Gradiente de profundidade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-emerald-900/20" />

        {/* Logo */}
        <div className="relative">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-500/60">
            Painel Administrativo
          </p>
          <h1 className="font-display mt-2 text-5xl font-bold uppercase leading-none tracking-tight text-white">
            Admin<br />
            <span className="text-emerald-400">Camisas</span>
          </h1>
          <div className="mt-5 h-px w-14 bg-emerald-500/40" />
        </div>

        {/* Tagline central */}
        <div className="relative">
          <blockquote className="text-3xl font-light leading-snug text-white/70">
            &ldquo;Gerencie seu catálogo<br />
            <span className="font-semibold text-white">com precisão</span> e<br />
            eficiência.&rdquo;
          </blockquote>
        </div>

        {/* Rodapé */}
        <div className="relative">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Loja de Camisas de Futebol
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        {children}
      </div>
    </div>
  )
}
