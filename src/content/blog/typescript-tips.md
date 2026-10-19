---
title: 让 TypeScript 更好用的 5 个实用技巧
date: 2026-09-15
tags: [TypeScript, 前端]
cover: https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=typescript%20code%20with%20type%20annotations%20glowing%20on%20dark%20editor%20background%2C%20minimal%20tech%20illustration%2C%20blue%20purple%20tones&image_size=landscape_16_9
---

TypeScript 用了很多年，这几个技巧是我在日常开发中真正高频使用的。

## 1. 用 satisfies 同时保留推断与校验

```ts
const config = {
  primary: '#7C6CFF',
  secondary: '#4FD1C5',
} satisfies Record<string, string>

// config.primary 的类型仍然是字面量 '#7C6CFF'
```

比类型注解保留了更精确的类型，比 `as` 更安全。

## 2.  discriminated union 建模状态

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error }

function render(state: RequestState) {
  switch (state.status) {
    case 'success':
      return state.data // 自动收窄为 User[]
    case 'error':
      return state.error.message
  }
}
```

## 3. 巧用泛型约束写工具函数

```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>
}

const user = { id: 1, name: '星河', email: 'hi@example.com' }
const subset = pick(user, ['id', 'name']) // 类型为 Pick<User, 'id' | 'name'>
```

## 4. 模板字面量类型拼路由

```ts
type Route = `/users/${string}` | `/posts/${string}`

function navigate(path: Route) {
  // 只能传入合法路由，写错直接报错
}

navigate('/users/123') // ✅
navigate('/unknown')   // ❌ 编译错误
```

## 5. const 断言锁定配置

```ts
const breakpoints = [1280, 768, 480] as const
type Breakpoint = (typeof breakpoints)[number] // 1280 | 768 | 480
```

## 小结

类型是工具不是目的。这几个技巧的共同点：**让编译器多干活，让运行时代码更简洁**。
