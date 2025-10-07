import { Result, result } from "../result";

enum MarkerType {
  Some,
  None,
}

function flattenObject<T extends object>(value: T): Option<Flattened<T>> {
  for (const key in value) {
    let prop = value[key];
    if (prop === null || prop === undefined) {
      return option.none();
    }
    if (typeof prop === "object" && "_marker" in prop) {
      const propOpt = prop as SerializableOption<unknown>;
      if (isNone(propOpt)) {
        return none();
      }
      prop = propOpt.value as any;
    }

    if (typeof prop === "object") {
      const maybeProp = flattenObject(prop as any);
      if (maybeProp.isNone()) {
        return option.none();
      }
      value[key] = maybeProp.value as any;
    }
    value[key] = prop;
  }
  return option.some(value as Flattened<T>);
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
 * Represents an
 */
export type Flattened<T> =
  T extends Option<infer U>
    ? Flattened<U>
    : T extends Record<string, unknown>
      ? { [P in keyof T]: Flattened<T[P]> }
      : T;

/**
 * Represents an `Option<T>` type with no value.
 */
export type None = {
  /** @ignore */
  readonly _marker: MarkerType.None;
};

/**
 * Represents an `Option<T>` type with a value.
 */
export type Some<T> = {
  readonly value: T;
  /** @ignore */
  readonly _marker: MarkerType.Some;
};

export type SerializableOption<T> = None | Some<T>;

export interface OptionUtils<T> {
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
   * Extracts the base value from this type, not checking if the value is `None`.
   * @returns The raw unchecked inner value of the `Option<T>`
   */
  unsafeUnwrap(): T | null | undefined;
  /**
   * Extracts the base value from this type. If there is no value in the `Option<T>`, the function will return the provided default value.
   * @param defaultValue The value to return if the `Option<T>` is a `None`.
   * @throws {OptionIsEmptyError} if the default value is `null` or `undefined`.
   * @returns The value of the `Option<T>` if it is a `Some<T>`, otherwise the default value.
   */
  unwrapOr(defaultValue: T): T;
  /**
   * Extracts the base value from this type. If there is no value in the `Option<T>`, the function will return whatever you provided as the
   * default value, even if that value was not provided (undefined).
   * @param defaultValue The value to return if the `Option<T>` is a `None`
   * @returns The possibly undefined | null value of the `Option<T>`.
   */
  unsafeUnwrapOr(defaultValue?: T | null): T | null | undefined;
  /**
   * Extracts the base value from this type. The function throws an error with the provided message if there is no value provided.
   * @throws {OptionIsEmptyError} if the default value is `null` or `undefined`.
   * @param message The message to throw if the `Option<T>` is a `None`.
   * @returns The value of the `Option<T>` if it is a `Some<T>`.
   */
  expect(message: string): T;
  /**
   * Peek into the inner value of this Option<T>, and if `isSome()` then the callback function will be run.
   * @param callback the callback to run if this Option `isSome`
   * @returns this `Option<T>`
   */
  inspect(callback: (value: T) => void): Option<T>;
  /**
   * Takes a possibly deeply nested Option<T> and flattens it so only the top level Option<T> is returned.
   * If any nested Option's are `None`, then this value returns a `None` type.
   * @returns A recursive flattened Option<T>
   */
  flatten(): Option<Flattened<T>>;
  /**
   * Converts this `Option<T>` type into a `Result<T, E>` type. The `Result<T, E>` will be an `Err<E>` if the `Option<T>` is a `None`.
   * @param error The error to return if the `Option<T>` is a `None`.
   * @returns A `Result<T, E>` type.
   */
  okOr<E extends Error>(error: E): Result<T, E>;
  okOr<E extends Error>(error: string): Result<T, Error>;
  okOr<E extends Error>(error: Error | string): Result<T, E>;
  /**
   * Maps the inner value of the Option<T> to a new value, returning a completely new Option<NewT>
   * @param mapFn The function which will be called if the Option<T> is a Some<T>
   * @returns A new Option<NewT> with the mapped value
   */
  map<NewT>(mapFn: (option: T) => NewT): Option<NewT>;
  /**
   * maps the value of this Option<T> to a Option<NewT> using the provided function. This is useful if you wish to chain
   * multiple Option<T> types together. Flattens the Option<Option<NewT>> to an Option<NewT>
   * @param mapFn The function which will be called if the Option<T> is a Some<T>
   */
  andThen<NewT>(mapFn: (option: T) => Option<NewT>): Option<NewT>;
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
      return isNone(this);
    },
    isSome(): this is Some<T> {
      return isSome(this);
    },
    unwrap() {
      if (this.isNone()) throw new OptionIsEmptyError();
      return this.value;
    },
    unsafeUnwrap() {
      if (this.isNone()) return undefined;
      return this.value;
    },
    unwrapOr(defaultValue) {
      if (this.isSome()) return this.value;
      if (defaultValue === null || defaultValue === undefined)
        throw new OptionIsEmptyError(
          "The provided default value was null or undefined.",
        );
      return defaultValue;
    },
    unsafeUnwrapOr(defaultValue) {
      if (this.isNone()) return defaultValue;
      return this.value;
    },
    expect(message) {
      if (this.isSome()) return this.value;
      throw new OptionIsEmptyError(message);
    },
    inspect(callback) {
      if (this.isSome()) callback(this.value);
      return this;
    },
    flatten(): Option<Flattened<T>> {
      if (this.isNone()) {
        return none();
      }
      if (typeof this.value === "object") {
        return flattenObject(this.value as object) as Option<Flattened<T>>;
      } else {
        return option.some(this.value as Flattened<T>);
      }
    },
    okOr(error) {
      if (this.isNone()) {
        if (error instanceof Error) return result.err(error);
        return result.err(new Error(error));
      }
      return result.ok(this.value);
    },
    map(mapFn) {
      if (this.isNone()) {
        return none();
      }
      return some(mapFn(this.value));
    },
    andThen(mapFn) {
      if (this.isNone()) {
        return none();
      }
      return mapFn(this.value);
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
function fromSerializableOption<T>(option?: SerializableOption<T>): Option<T> {
  if (option && option._marker === MarkerType.Some) {
    return some(option.value);
  } else {
    return none();
  }
}

/**
 * Constructs an `Option<T>` type with no value.
 * @returns An `Option<T>` type with no value.
 */
function none<T>(): Option<T> {
  return buildOption({ _marker: MarkerType.None });
}

/**
 * Constructs an `Option<T>` type with a provided value.
 * @param value The value to store in the `Option<T>`.
 * @returns An `Option<T>` type with the provided value.
 */
function some<T>(value: T): Option<T> {
  return buildOption({ value, _marker: MarkerType.Some });
}

/**
 * Constructs an `Option<T>` type with a provided value and a marker indicating that it is a Some.
 * @param value The value to store in the `Option<T>`.
 * @returns An `Option<T>` type with the provided value and a marker indicating that it is a Some.
 */
function unknown<T>(value?: T | null): Option<T> {
  if (value === undefined || value === null) {
    return none();
  }
  return some(value);
}

/**
 * A static helper function to check if an input is `None`. Useful if you want to check a `SerializableOption`
 * without re-serializing into an `Option`.
 * @param input - A `SerializableOption`
 * @returns Whether or not the input is `None`
 */
function isNone<T>(input: SerializableOption<T>): input is None;
/**
 * A static helper function to check if an input is `None`. Useful if you want to check a `SerializableOption`
 * without re-serializing into an `Option`.
 * @param input - An `Option`
 * @returns Whether or not the input is `None`
 */
function isNone<T>(input: Option<T>): input is None & OptionUtils<T>;
function isNone<T>(input: Option<T> | SerializableOption<T>): input is None {
  return input._marker === MarkerType.None;
}

/**
 * A static helper function to check if an input is `Some<T>`. Useful if you want to check a `SerializableOption`
 * without re-serializing into an `Option`.
 * @param input - A `SerializableOption`
 * @returns Whether or not the input is `Some<T>`
 */
function isSome<T>(input: SerializableOption<T>): input is Some<T>;
/**
 * A static helper function to check if an input is `Some<T>`. Useful if you want to check a `SerializableOption`
 * without re-serializing into an `Option`.
 * @param input - An `Option`
 * @returns Whether or not the input is `Some<T>`
 */
function isSome<T>(input: Option<T>): input is Some<T> & OptionUtils<T>;
function isSome<T>(input: Option<T> | SerializableOption<T>): input is Some<T> {
  return input._marker === MarkerType.Some;
}

/**
 * Represents the `Option<T>` module exported from the `option` package all packaged under one namespace.
 */
export const option = {
  some,
  none,
  isSome,
  isNone,
  unknown,
  fromSerializableOption,
};
