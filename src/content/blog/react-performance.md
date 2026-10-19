---
title: React 性能优化实践：从 4 秒到 1 秒
date: 2026-10-01
tags: [React, 性能优化]
cover: https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=react%20performance%20optimization%20concept%2C%20speedometer%20with%20code%20on%20dark%20blue%20background%2C%20futuristic%20minimal%20illustration&image_size=landscape_16_9
---

在最近的项目中，我把一个数据看板的首屏加载时间从 4 秒优化到了 1.2 秒。这篇文章记录整个优化过程。

## 定位问题

优化之前先测量。通过 Chrome DevTools 的 Performance 面板，发现主要瓶颈有三个：

- 首屏 JS 包体积过大（1.8MB）
- 长列表一次性渲染 2000+ DOM 节点
- 重复的无效重渲染

## 代码分割

用动态 import 按路由拆分，首屏只加载必要代码：

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}
```

配合 Vite 的 `manualChunks`，把 ECharts 这样的重型依赖单独分包，按需加载。

## 长列表虚拟化

2000 行的表格只渲染可视区域内的约 30 行：

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Row[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map((row) => (
        <Row key={row.key} data={items[row.index]} />
      ))}
    </div>
  )
}
```

## 减少重渲染

三个常用手段：

1. `useMemo` 缓存昂贵计算
2. `useCallback` 稳定函数引用
3. `React.memo` 阻断无关更新

```tsx
const Chart = memo(function Chart({ data }: { data: Point[] }) {
  const option = useMemo(() => buildOption(data), [data])
  return <ReactECharts option={option} />
})
```

## 成果

| 指标 | 优化前 | 优化后 |
|---|---|---|
| 首屏 JS | 1.8MB | 380KB |
| LCP | 4.0s | 1.2s |
| 长列表帧率 | 12fps | 58fps |

核心思路一句话总结：**先测量，再优化；首屏做减法，交互做缓存**。
