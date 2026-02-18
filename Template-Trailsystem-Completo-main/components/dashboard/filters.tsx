"use client"

import { useState } from "react"
import { Filter, Calendar, User, Users, Building2, Tag, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const presets = [
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "Últimos 7 dias", value: "7dias" },
  { label: "Últimos 30 dias", value: "30dias" },
  { label: "Esta Semana", value: "esta-semana" },
  { label: "Semana Passada", value: "semana-passada" },
  { label: "Este Mês", value: "este-mes" },
  { label: "Mês Passado", value: "mes-passado" },
  { label: "Este Ano", value: "este-ano" },
]

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"]
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

interface CalendarGridProps {
  year: number
  month: number
  startDate: Date | null
  endDate: Date | null
  onSelectDate: (date: Date) => void
  onChangeMonth: (delta: number) => void
}

function CalendarGrid({ year, month, startDate, endDate, onSelectDate, onChangeMonth }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isInRange = (day: number) => {
    if (!startDate || !endDate || !day) return false
    const current = new Date(year, month, day)
    return current >= startDate && current <= endDate
  }

  const isStart = (day: number) => {
    if (!startDate || !day) return false
    return startDate.getDate() === day && startDate.getMonth() === month && startDate.getFullYear() === year
  }

  const isEnd = (day: number) => {
    if (!endDate || !day) return false
    return endDate.getDate() === day && endDate.getMonth() === month && endDate.getFullYear() === year
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div className="w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="p-1 hover:bg-accent rounded"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium">
          {meses[month]} de {year}
        </span>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="p-1 hover:bg-accent rounded"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasSemana.map((dia, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
            {dia}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const isRangeDay = day && isInRange(day) && !isStart(day) && !isEnd(day)
          const isStartDay = day && isStart(day)
          const isEndDay = day && isEnd(day)
          const isTodayDay = day && isToday(day) && !isStartDay && !isEndDay
          
          return (
            <button
              key={i}
              type="button"
              disabled={!day}
              onClick={() => day && onSelectDate(new Date(year, month, day))}
              className={cn(
                "h-8 w-8 text-xs flex items-center justify-center transition-colors relative rounded-full",
                !day && "invisible",
                day && !isRangeDay && !isStartDay && !isEndDay && "hover:bg-accent",
                isRangeDay && "border border-primary text-primary",
                isStartDay && "bg-primary text-primary-foreground z-10",
                isEndDay && "bg-primary text-primary-foreground z-10",
                isTodayDay && "border-2 border-primary text-primary font-bold"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Filters() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("este-mes")
  const [startDate, setStartDate] = useState<Date | null>(new Date(2025, 10, 5))
  const [endDate, setEndDate] = useState<Date | null>(new Date(2025, 10, 26))
  const [leftMonth, setLeftMonth] = useState({ year: 2025, month: 10 })
  const [rightMonth, setRightMonth] = useState({ year: 2025, month: 11 })
  const [selectingStart, setSelectingStart] = useState(true)

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset)
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (preset) {
      case "hoje":
        start = today
        break
      case "ontem":
        start = new Date(today)
        start.setDate(start.getDate() - 1)
        end = start
        break
      case "7dias":
        start = new Date(today)
        start.setDate(start.getDate() - 7)
        break
      case "30dias":
        start = new Date(today)
        start.setDate(start.getDate() - 30)
        break
      case "esta-semana":
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay())
        break
      case "semana-passada":
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay() - 7)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        break
      case "este-mes":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "mes-passado":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case "este-ano":
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        start = today
    }

    setStartDate(start)
    setEndDate(end)
    setLeftMonth({ year: start.getFullYear(), month: start.getMonth() })
    setRightMonth({ year: end.getFullYear(), month: end.getMonth() === start.getMonth() ? end.getMonth() + 1 : end.getMonth() })
  }

  const handleDateSelect = (date: Date) => {
    // Limpa o preset selecionado quando o usuário seleciona uma data manualmente
    setSelectedPreset("")
    
    if (selectingStart || (startDate && date < startDate)) {
      setStartDate(date)
      setEndDate(null)
      setSelectingStart(false)
    } else {
      setEndDate(date)
      setSelectingStart(true)
    }
  }

  const handleApply = () => {
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const displayText = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : presets.find(p => p.value === selectedPreset)?.label || "Este Mês"

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtros:</span>
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 text-sm bg-background gap-2 font-normal">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="flex">
              {/* Presets */}
              <div className="border-r border-border py-2 px-1 flex flex-col">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetClick(preset.value)}
                    className={cn(
                      "block whitespace-nowrap text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                      selectedPreset === preset.value 
                        ? "text-primary font-medium" 
                        : "hover:text-primary text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Calendars - vertical with scroll */}
              <div className="p-4 max-h-[320px] overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <CalendarGrid
                    year={leftMonth.year}
                    month={leftMonth.month}
                    startDate={startDate}
                    endDate={endDate}
                    onSelectDate={handleDateSelect}
                    onChangeMonth={(delta) => setLeftMonth(prev => {
                      let newMonth = prev.month + delta
                      let newYear = prev.year
                      if (newMonth < 0) {
                        newMonth = 11
                        newYear--
                      } else if (newMonth > 11) {
                        newMonth = 0
                        newYear++
                      }
                      return { year: newYear, month: newMonth }
                    })}
                  />
                  <CalendarGrid
                    year={rightMonth.year}
                    month={rightMonth.month}
                    startDate={startDate}
                    endDate={endDate}
                    onSelectDate={handleDateSelect}
                    onChangeMonth={(delta) => setRightMonth(prev => {
                      let newMonth = prev.month + delta
                      let newYear = prev.year
                      if (newMonth < 0) {
                        newMonth = 11
                        newYear--
                      } else if (newMonth > 11) {
                        newMonth = 0
                        newYear++
                      }
                      return { year: newYear, month: newMonth }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Footer - full width */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {startDate && endDate ? (
                  <span>{formatDate(startDate)} <span className="text-foreground">até</span> {formatDate(endDate)}</span>
                ) : startDate ? (
                  <span>{formatDate(startDate)} <span className="text-foreground">até</span> ...</span>
                ) : (
                  <span>Selecione um período</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} className="bg-transparent">
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Select defaultValue="todos">
        <SelectTrigger className="w-[155px] h-8 text-sm bg-background">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Vendedor:</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="carlos">Carlos Silva</SelectItem>
          <SelectItem value="maria">Maria Santos</SelectItem>
          <SelectItem value="joao">João Oliveira</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="todos">
        <SelectTrigger className="w-[145px] h-8 text-sm bg-background">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Parceiro:</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="direto">Direto</SelectItem>
          <SelectItem value="revenda">Revenda</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="matriz">
        <SelectTrigger className="w-[135px] h-8 text-sm bg-background">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Filial:</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="matriz">Matriz</SelectItem>
          <SelectItem value="filial-1">Filial 1</SelectItem>
          <SelectItem value="filial-2">Filial 2</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="todas">
        <SelectTrigger className="w-[150px] h-8 text-sm bg-background">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Categoria:</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="drywall">Drywall</SelectItem>
          <SelectItem value="steel-frame">Steel Frame</SelectItem>
          <SelectItem value="forros">Forros</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto">
        <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent">
          <Settings className="h-3.5 w-3.5" />
          Personalizar
        </Button>
      </div>
    </div>
  )
}
