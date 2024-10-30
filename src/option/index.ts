import { err, ok, Result } from "../result";

enum MarkerType {
  Some,
  None,
}

/**
 * Represents an error that occurs when attempting to unwrap an empty `Option<T>`.
 */
export class OptionIsEmptyError extends Error {
  constructor(message?: string) {
    super(message ?? "The Option provided was unwrapped with an empty value");
    this.name = "OptionIsEmptyError";
  }
}

/**
 * Represents an `Option<T>` type with no value.
 */
export type None = {
  readonly _marker: MarkerType.None;
};

/**
 * Represents an `Option<T>` type with a value.
 */
export type Some<T> = {
  readonly value: T;
  readonly _marker: MarkerType.Some;
};

export type SerializableOption<T> = None | Some<T>;

interface OptionUtils<T> {
  /**
   * Utility function to determine whether this `Option<T>` type is a `Some` type.
   * @returns `true` if the `Option<T>` is a `Some<T>`, otherwise `false`.
   */
  isSome(): this is Some<T>;
  /**
   * Utility function to determine whether this `Option<T>` type is a `None` type.
   * @returns `true` if the `Option<T>` is a `None`, otherwise `false`.
   */
  isNone(): this is None;
  /**
   * Extracts the base value from this type. This function will throw an error if there is no value in the `Option<T>`.
   * @throws {OptionIsEmptyError} if the `Option<T>` is a `None`.
   * @returns The value of the `Option<T>`.
   */
  unwrap(): T;
  /**
   * Extracts the base value from this type. If there is no value in the `Option<T>`, the function will return the provided default value.
   * @param defaultValue The value to return if the `Option<T>` is a `None`.
   * @throws {OptionIsEmptyError} if the default value is `null` or `undefined`.
   * @returns The value of the `Option<T>` if it is a `Some<T>`, otherwise the default value.
   */
  unwrapOr(defaultValue: T): T;
  /**
   * Extracts the base value from this type. The function throws an error with the provided message if there is no value provided.
   * @throws {OptionIsEmptyError} if the default value is `null` or `undefined`.
   * @param message The message to throw if the `Option<T>` is a `None`.
   * @returns The value of the `Option<T>` if it is a `Some<T>`.
   */
  expect(message: string): T;
  /**
   * Converts this `Option<T>` type into a `Result<T, E>` type. The `Result<T, E>` will be an `Err<E>` if the `Option<T>` is a `None`.
   * @param error The error to return if the `Option<T>` is a `None`.
   * @returns A `Result<T, E>` type.
   */
  okOr<E extends Error>(error: E): Result<T, E>;
  /**
   * Maps the inner value of the Option<T> to a new value, returning a completely new Option<NewT>
   * @param mapFn The function which will be called if the Option<T> is a Some<T>
   * @returns A new Option<NewT> with the mapped value
   */
  map<NewT>(mapFn: (option: T) => NewT): Option<NewT>;
  /**
   * A utility function to convert an Option<T> to a SerializableOption<T>. This is a useful function if you wish to store
   * an Option<T> in Redux, as Redux does not allow non-serializable fields (functions) in its store.
   * @returns An Option<T> without any helper functions
   */
  serialize(): SerializableOption<T>;
}

/**
 * Represents an `Option<T>` type that can contain a value of type `T`.
 * @typeParam T - The type of the value that the `Option<T>` can contain.
 * @see Some
 * @see None
 */
export type Option<T> = SerializableOption<T> & OptionUtils<T>;

function buildOption<T>(innerType: Some<T> | None): Option<T> {
  return {
    ...innerType,
    isNone(): this is None {
      return this._marker === MarkerType.None;
    },
    isSome(): this is Some<T> {
      return this._marker === MarkerType.Some;
    },
    unwrap() {
      if (this.isNone()) throw new OptionIsEmptyError();
      return this.value;
    },
    unwrapOr(defaultValue) {
      if (this.isSome()) return this.value;
      if (defaultValue === null || defaultValue === undefined)
        throw new OptionIsEmptyError(
          "The provided default value was null or undefined."
        );
      return defaultValue;
    },
    expect(message) {
      if (this.isSome()) return this.value;
      throw new OptionIsEmptyError(message);
    },
    okOr(error) {
      if (this.isNone()) return err(error);
      return ok(this.value);
    },
    map(mapFn) {
      if (this.isNone()) {
        return none();
      }
      return some(mapFn(this.value));
    },
    serialize(): SerializableOption<T> {
      if (this.isNone()) {
        return { _marker: this._marker };
      } else
        return {
          _marker: this._marker,
          value: this.value,
        };
    },
  };
}

/**
 * Takes a SerializableOption<T> and returns an Option<T> with all the utility functions.
 * @param option A serializable option which can be converted into JSON.
 * @returns An Option<T> with all the data from the SerializableOption<T> plus the utility functions
 */
export function fromSerializableOption<T>(
  option: SerializableOption<T>
): Option<T> {
  if (option._marker === MarkerType.None) {
    return none();
  } else {
    return some(option.value);
  }
}

/**
 * Constructs an `Option<T>` type with no value.
 * @returns An `Option<T>` type with no value.
 */
export function none<T>(): Option<T> {
  return buildOption({ _marker: MarkerType.None });
}

/**
 * Constructs an `Option<T>` type with a provided value.
 * @param value The value to store in the `Option<T>`.
 * @returns An `Option<T>` type with the provided value.
 */
export function some<T>(value: T): Option<T> {
  return buildOption({ value, _marker: MarkerType.Some });
}

export default {
  some,
  none,
  fromSerializableOption
}
