export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with ID "${id}" was not found`, "NOT_FOUND");
  }
}

export class InvariantViolationError extends AppError {
  constructor(message: string) {
    super(message, "INVARIANT_VIOLATION");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly details?: unknown) {
    super(message, "VALIDATION_FAILED");
  }
}

export class SessionError extends AppError {
  constructor(message: string) {
    super(message, "SESSION_ERROR");
  }
}

export class EventStoreError extends AppError {
  constructor(message: string) {
    super(message, "EVENT_STORE_ERROR");
  }
}
