/**
 * Custom error wrapper for assertion errors.
 */
export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

/**
 * Assertion utilities for runtime checks
 */
export class Assert {
  /**
   * Asserts that a value exists (is not null or undefined)
   * @param value - The value to check for existence
   * @param message - Error message to throw if assertion fails
   * @throws {AssertionError} if value is null or undefined
   */
  static exists<T>(
    value: T | null | undefined,
    message: string
  ): asserts value is T {
    if (value === null || value === undefined) {
      throw new AssertionError(message);
    }
  }

  /**
   * Asserts that a condition is true
   * @param condition - The boolean condition to check
   * @param message - Error message to throw if assertion fails
   * @throws {AssertionError} if condition is false
   */
  static isTrue(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new AssertionError(message);
    }
  }

  /**
   * Asserts that a value passes a custom condition
   * @param value - The value to check
   * @param condition - Function that returns true if value passes the condition
   * @param message - Error message to throw if assertion fails
   * @throws {AssertionError} if condition returns false
   */
  static passes<T>(
    value: T,
    condition: (val: T) => boolean,
    message: string
  ): asserts value {
    if (!condition(value)) {
      throw new AssertionError(message);
    }
  }

  /**
   * Asserts that a value is not null or undefined and passes a condition
   * @param value - The value to check for existence and condition
   * @param condition - Function that returns true if value passes the condition
   * @param message - Error message to throw if assertion fails
   * @throws {AssertionError} if value doesn't exist or condition fails
   */
  static existsAndPasses<T>(
    value: T | null | undefined,
    condition: (val: T) => boolean,
    message: string
  ): asserts value is T {
    this.exists(value, message);
    this.passes(value, condition, message);
  }

  /**
   * Asserts that a value is of a specific type
   * @param value - The value to check
   * @param typeGuard - Type guard function that returns true if value is of type T
   * @param message - Error message to throw if assertion fails
   * @throws {AssertionError} if value is not of the expected type
   */
  static isType<T>(
    value: unknown,
    typeGuard: (val: unknown) => val is T,
    message: string
  ): asserts value is T {
    if (!typeGuard(value)) {
      throw new AssertionError(message);
    }
  }
}
