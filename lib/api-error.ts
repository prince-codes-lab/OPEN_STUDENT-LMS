export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends APIError {
  constructor(
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(400, message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends APIError {
  constructor(message = "Authentication required") {
    super(401, message, "AUTH_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends APIError {
  constructor(message = "Insufficient permissions") {
    super(403, message, "AUTHZ_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(409, message, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class InternalServerError extends APIError {
  constructor(message = "Internal server error") {
    super(500, message, "INTERNAL_ERROR")
    this.name = "InternalServerError"
  }
}

export function handleAPIError(error: unknown) {
  console.error("[v0] API Error:", error)

  if (error instanceof APIError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      errors: error instanceof ValidationError ? error.errors : undefined,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    }
  }

  return {
    success: false,
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  }
}
