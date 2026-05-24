export function SettingsPanel({
  checks,
}: {
  checks: Array<{ label: string; ok: boolean; hint: string }>
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
          Variables critiques
        </p>
        <h2 className="mt-3 text-xl font-semibold">Etat de configuration</h2>

        <div className="mt-6 space-y-3">
          {checks.map((check) => (
            <div
              key={check.label}
              className="rounded-[24px] border border-[var(--border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium">{check.label}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    check.ok
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {check.ok ? "Configure" : "A renseigner"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {check.hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
          Checklist
        </p>
        <h2 className="mt-3 text-xl font-semibold">Durcissement recommande</h2>

        <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
          <li>Appliquer la migration SQL pour ajouter le hash de mot de passe et le verrouillage de compte.</li>
          <li>Generer un hash de mot de passe admin avec `npm run admin:hash -- "motdepassefort"`.</li>
          <li>Mettre `role = ADMIN` sur le compte utilisateur cible dans Supabase.</li>
          <li>Renseigner `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` et `ADMIN_SESSION_SECRET`.</li>
          <li>Faire tourner le back-office uniquement derriere HTTPS en production.</li>
        </ol>
      </div>
    </section>
  )
}
