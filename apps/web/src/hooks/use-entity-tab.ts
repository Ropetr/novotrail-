import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTabs } from "@/contexts/tabs-context"

export interface OpenEntityTabOptions {
  type: string // "cliente", "fornecedor", "produto", etc
  entityId: string | number // ID da entidade
  title: string // Título da aba (ex: "Cliente: João Silva")
  basePath?: string // Caminho base (ex: "/cadastros/clientes")
}

/**
 * Hook personalizado para abrir entidades em abas individuais
 *
 * Exemplo de uso:
 * ```tsx
 * const { openEntityTab } = useEntityTab()
 *
 * openEntityTab({
 *   type: "cliente",
 *   entityId: 5,
 *   title: "Cliente: João Silva",
 *   basePath: "/cadastros/clientes"
 * })
 * ```
 */
export function useEntityTab() {
  const { addTab } = useTabs()
  const navigate = useNavigate()

  const openEntityTab = useCallback(
    ({ type, entityId, title, basePath }: OpenEntityTabOptions) => {
      // Constrói o href baseado no tipo e ID
      const href = basePath ? `${basePath}/${entityId}` : `/${type}/${entityId}`

      // Adiciona a aba com type e entityId para ID único
      const tabId = addTab({
        title,
        href,
        type,
        entityId,
        closable: true,
      })

      // Navega para a rota
      navigate(href)

      return tabId
    },
    [addTab, navigate]
  )

  return { openEntityTab }
}
