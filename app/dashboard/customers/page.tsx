import { CustomerManager } from "@/components/dashboard/customer-manager"
import { PageFrame } from "@/components/page-frame"
import { userService } from "@/features/users/service"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const users = await userService.getUsers()

  return (
    <PageFrame
      title="Clients"
      description="Visualisation des comptes, suspension d'acces et gestion des roles CLIENT ou ADMIN."
    >
      <CustomerManager initialUsers={users} />
    </PageFrame>
  )
}
