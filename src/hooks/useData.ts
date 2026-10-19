import { useEffect, useState } from 'react'

/** 通用异步数据加载 Hook：返回 null 表示未就绪 */
export function useData<T>(loader: () => Promise<T>): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    let alive = true
    loader().then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return data
}
