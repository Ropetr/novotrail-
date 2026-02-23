"use client"

import { Filters } from "@/components/dashboard/filters"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TopClients } from "@/components/dashboard/top-clients"
import { SellersRanking } from "@/components/dashboard/sellers-ranking"
import { TopProducts } from "@/components/dashboard/top-products"
import { StalledProducts } from "@/components/dashboard/stalled-products"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Filters />
      <KPICards />
      <div className="grid gap-4 lg:grid-cols-3">
        <SalesChart />
        <CategoryChart />
        <TopClients />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SellersRanking />
        <TopProducts />
        <StalledProducts />
      </div>
    </div>
  )
}


