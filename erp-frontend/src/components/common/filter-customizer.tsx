"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface FilterOption {
  id: string
  label: string
  enabled: boolean
}

interface FilterCustomizerProps {
  filters: FilterOption[]
  onSave: (filters: FilterOption[]) => void
}

export function FilterCustomizer({ filters, onSave }: FilterCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterOption[]>(filters)

  const handleToggleFilter = (filterId: string) => {
    setLocalFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
      )
    )
  }

  const handleSave = () => {
    onSave(localFilters)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setLocalFilters(filters)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setLocalFilters(filters)
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-primary hover:text-primary/80 transition-colors"
          title="Customizar Filtros"
        >
          <Settings className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customizar Filtros</DialogTitle>
          <DialogDescription>
            Selecione quais filtros deseja exibir nesta tela
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {localFilters.map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={filter.enabled}
                  onCheckedChange={() => handleToggleFilter(filter.id)}
                />
                <Label
                  htmlFor={filter.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {filter.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




