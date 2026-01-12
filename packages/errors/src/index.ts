export class DomainError extends Error {
  constructor(message: string, public code: string, public meta?: Record<string, any>) {
    super(message);
    this.name = 'DomainError';
  }
}

export class BadRequestError extends DomainError {
  constructor(message = 'Bad Request', meta?: Record<string, any>) { super(message, 'BAD_REQUEST', meta); }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized', meta?: Record<string, any>) { super(message, 'UNAUTHORIZED', meta); }
}

export class ConflictError extends DomainError {
  constructor(message = 'Conflict', meta?: Record<string, any>) { super(message, 'CONFLICT', meta); }
}
