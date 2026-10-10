let accessToken = ''

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = ''
}

export function getAccessToken(): string {
  return accessToken
}
