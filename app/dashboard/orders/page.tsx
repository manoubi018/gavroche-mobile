import { OrderManager } from "@/components/dashboard/order-manager"
import { PageFrame } from "@/components/page-frame"
import { orderService } from "@/features/orders/service"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const orders = await orderService.getOrders()

  return (
    <PageFrame
      title="Commandes"
      description="Statuts, coordonnees et traitement des commandes clients."
    >
      <OrderManager initialOrders={orders} />
    </PageFrame>
  )
}
