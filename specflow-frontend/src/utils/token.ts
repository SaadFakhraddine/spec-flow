let accessToken = ''

export function setAccessToken(token: string): void {
  accessToken = token
}

export function getAccessToken(): string {
  return accessToken
}
