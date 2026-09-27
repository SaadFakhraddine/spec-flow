export class AppError extends Error {
  readonly statusCode: number
  readonly errors?: string[]

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.errors = errors
  }
}
