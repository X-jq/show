import { keys, readJSON, writeJSON } from './storage'

/** 默认账号 admin / admin123（仅存 sha256 哈希，不存明文） */
export const DEFAULT_USERNAME = 'admin'
export const DEFAULT_PWD_HASH =
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000 // 7 天

interface AuthSession {
  token: string
  expiresAt: number
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getPwdHash(): string {
  return readJSON<string>(keys.pwdhash) ?? DEFAULT_PWD_HASH
}

/** 登录：比对用户名与密码哈希，成功则签发 token */
export async function login(username: string, password: string): Promise<boolean> {
  if (username !== DEFAULT_USERNAME) return false
  const hash = await sha256(password)
  if (hash !== getPwdHash()) return false
  const session: AuthSession = {
    token: crypto.randomUUID(),
    expiresAt: Date.now() + TOKEN_TTL,
  }
  writeJSON(keys.auth, session)
  return true
}

export function logout(): void {
  localStorage.removeItem(keys.auth)
}

/** 校验登录态是否有效（含过期检查） */
export function isAuthed(): boolean {
  const session = readJSON<AuthSession>(keys.auth)
  if (!session?.token) return false
  if (Date.now() > session.expiresAt) {
    logout()
    return false
  }
  return true
}

/** 修改密码：需验证旧密码 */
export async function changePassword(oldPwd: string, newPwd: string): Promise<boolean> {
  if ((await sha256(oldPwd)) !== getPwdHash()) return false
  writeJSON(keys.pwdhash, await sha256(newPwd))
  return true
}
