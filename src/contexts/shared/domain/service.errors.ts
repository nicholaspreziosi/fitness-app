export type ServiceErrorCode =
  | 'not_found'
  | 'invalid_operation'
  | 'validation'
  | 'unknown';

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: ServiceErrorCode
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
