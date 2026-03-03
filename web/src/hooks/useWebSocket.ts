import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProjectStore } from '@/stores/project'
import { useConnectionStore } from '@/stores/connection'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const mode = useConnectionStore((s) => s.mode)
  const remoteUrl = useConnectionStore((s) => s.remoteUrl)

  useEffect(() => {
    // No WebSocket needed in local mode
    if (mode === 'local') return

    const wsBase = remoteUrl || window.location.origin
    const protocol = wsBase.startsWith('https') ? 'wss:' : 'ws:'
    const host = remoteUrl
      ? new URL(remoteUrl).host
      : window.location.host
    const url = `${protocol}//${host}/ws`

    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'file_change') {
            const currentProject = useProjectStore.getState().currentProject
            if (!data.project || !currentProject || data.project === currentProject) {
              queryClient.invalidateQueries({ queryKey: ['items'] })
              queryClient.invalidateQueries({ queryKey: ['item'] })
            }
            queryClient.invalidateQueries({ queryKey: ['projects'] })
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      wsRef.current?.close()
    }
  }, [queryClient, mode, remoteUrl])
}
