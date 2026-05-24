import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { PageFrame } from "@/components/page-frame"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  const checks = [
    {
      label: "SUPABASE_SERVICE_ROLE_KEY",
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hint: "Utilise une cle serveur pour que les operations admin ne reposent pas sur une cle publique.",
    },
    {
      label: "CLOUDINARY_API_KEY",
      ok: Boolean(process.env.CLOUDINARY_API_KEY),
      hint: "Permet de signer les uploads image depuis le serveur admin.",
    },
    {
      label: "CLOUDINARY_API_SECRET",
      ok: Boolean(process.env.CLOUDINARY_API_SECRET),
      hint: "Secret serveur obligatoire pour les uploads Cloudinary signes.",
    },
    {
      label: "ADMIN_SESSION_SECRET",
      ok: Boolean(process.env.ADMIN_SESSION_SECRET),
      hint: "Sert a signer la session HTTP-only et a proteger l'acces admin.",
    },
  ]

  return (
    <PageFrame
      title="Securite"
      description="Etat des secrets critiques, rappels de migration et points de durcissement avant mise en production."
    >
      <SettingsPanel checks={checks} />
    </PageFrame>
  )
}
