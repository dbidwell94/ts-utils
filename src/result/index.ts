import { none, Option, some } from "../option";

/**
 * Represents the two possible inner types of a `Result<T, E>`
 */
enum MarkerType {
  /**
   * A marker used for the `Success<T>` inner type of a `Result<T, E>`
   */
  Success,
  /**
   * A marker used for the `Failure<E>` inner type of a `Result<T, E>`
   */
  Failure,
}

/**
 * Represents the Success type of a `Result<T, E>`
 */
export type Success<T> = {
  readonly value: T;
};

/**
 * Represents the Failure type of a `Result<T, E>`
 */
export type Failure<E extends Error = Error> = {
  readonly error: E;
};

interface ResultUtils<T, E extends Error = Error> {
  /**
   * Utility function to determine if the inner type is a `Failure<E>`
   * @returns `true` if the inner type is a `Failure<E>`, otherwise `false`
   */
  isError(): this is Failure<E>;
  /**
   * Utility function to determine if the inner type is a `Success<T>`
   * @returns `true` if the inner type is a `Success<T>`, otherwise `false`
   */
  isOk(): this is Success<T>;
  /**
   * Unwraps the `Result<T, E>`. Throws the inner type if it was a `Failure<E>`
   * @throws {E} - If the inner type was a `Failure<E>`
   * @returns The inner type if it was a `Success<T>`
   */
  unwrap(): T;
  /**
   * Unwraps the `Result<T, E>`. Returns the provided default value if the inner type was a `Failure<E>`
   * @param defaultValue - The value to return if the inner type was a `Failure<E>`
   * @returns The inner type if it was a `Success<T>`, otherwise the provided default value
   */
  unwrapOr(defaultValue: T): T;
  /**
   * Unwraps the `Result<T, E>`. Throws the provided error if the inner type was a `Failure<E>`
   * @param error - The error to throw if the inner type was a `Failure<E>`
   * @throws {E} - If the inner type was a `Failure<E>`
   * @returns The inner type if it was a `Success<T>`
   */
  unwrapOrElse(error: E): T;
  /**
   * Useful if you do not care if there is an error, you only want to know if there is a value.
   * @returns An `Option<T>` if the inner type was a `Success<T>`, otherwise `None`
   * @see Option
   */
  ok(): Option<T>;
  /**
   * Useful if you do not care if there is a value, you only want to know if there is an error.
   * @returns An `Option<E>` if the inner type was a `Failure<E>`, otherwise `None`
   * @see Option
   */
  err(): Option<E>;
  /**
   * Maps a `Result<T, E>` to `Result<NewT, E>` by applying a function to a contained `Success<T>` value, leaving an `Error<E>` value untouched.
   * @param fn - The function to apply to the inner value
   */
  mapOk<NewT>(fn: (value: T) => NewT): Result<NewT, E>;
  /**
   * Maps a `Result<T, E>` to `Result<T, NewE>` by applying a function to a contained `Error<E>` value, leaving a `Success<T>` value untouched.
   * @param fn - The function to apply to the inner error
   */
  mapErr<NewE extends Error>(fn: (error: E) => NewE): Result<T, NewE>;
}

/**
 * Represents a `Result<T, E>` type that can be either a `Success<T>` or a `Failure<E>`
 * @typeParam T - The type of the value contained in the `Result<T, E>`
 * @typeParam E - The type of the error contained in the `Result<T, E>`
 * @see Success
 * @see Failure
 */
export type Result<T, E extends Error = Error> = (Success<T> | Failure<E>) &
  ResultUtils<T, E>;

function buildResult<T, E extends Error>(
  inner: Success<T> | Failure<E>,
  marker: MarkerType
): Result<T, E> {
  return {
    ...inner,
    isOk(): this is Success<T> {
      return marker === MarkerType.Success;
    },
    isError(): this is Failure<E> {
      return marker === MarkerType.Failure;
    },
    unwrap() {
      if (this.isError()) {
        throw this.error;
      }
      return this.value;
    },
    unwrapOr(defaultValue) {
      if (this.isError()) {
        return defaultValue;
      }
      return this.value;
    },
    unwrapOrElse(error) {
      if (this.isError()) {
        throw error;
      }
      return this.value;
    },
    ok(): Option<T> {
      if (this.isOk()) {
        return some(this.value);
      }
      return none();
    },
    err(): Option<E> {
      if (this.isError()) {
        return some(this.error);
      }
      return none();
    },
    mapOk<NewT>(fn: (value: T) => NewT): Result<NewT, E> {
      if (this.isOk()) {
        return ok(fn(this.value));
      }
      return err(this.error);
    },
    mapErr<NewE extends Error>(fn: (error: E) => NewE): Result<T, NewE> {
      if (this.isError()) {
        return err(fn(this.error));
      }
      return ok(this.value);
    },
  };
}

export function err<T>(error: string): Result<T, Error>;
export function err<T, E extends Error = Error>(error: E): Result<T, E>;
/**
 * Constructs a `Result<T, E>` type with a `Failure<E>` inner type.
 * @param error The error to wrap in the `Result<T, E>`
 * @returns A `Result<T, E>` type with a `Failure<E>` inner type
 */
export function err<T, E extends Error = Error>(error: E | string): Result<T, E> {
  if (typeof error === "string") {
    return buildResult({ error: new Error(error) } as Failure<E>, MarkerType.Failure);
  } else {
    return buildResult({ error } as Failure<E>, MarkerType.Failure);
  }

}

/**
 * Constructs a `Result<T, E>` type with a `Success<T>` inner type.
 * @param value The value to wrap in the `Result<T, E>`
 * @returns A `Result<T, E>` type with a `Success<T>` inner type
 */
export function ok<T, E extends Error = Error>(value: T): Result<T, E> {
  const innerType: Success<T> = {
    value,
  };

  return buildResult(innerType, MarkerType.Success);
}
