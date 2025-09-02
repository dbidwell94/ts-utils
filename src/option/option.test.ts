import { OptionIsEmptyError, option } from ".";

describe("src/utility/option.ts", () => {
  it("Constructs an Option<T> type with a provided value", () => {
    const optionValue = option.some(1);

    expect(optionValue.isSome()).toBeTruthy();
  });

  it("Constructs an Option<T> with no provided value", () => {
    const optionValue = option.none();

    expect(optionValue.isNone()).toBeTruthy();
  });

  it("Throws an error on unwrap() if the Option<T> is empty", () => {
    const optionValue = option.none();

    expect(() => optionValue.unwrap()).toThrow(OptionIsEmptyError);
  });

  it("Provdes a default value on unwrapOrDefault() if the Option<T> is empty", () => {
    const optionValue = option.none();

    expect(optionValue.unwrapOr(3)).toEqual(3);
  });

  it("Throws an error if the argument for unwrapOr() is undefined or null", () => {
    const optionValue = option.none();

    expect(() => optionValue.unwrapOr(null as never)).toThrow(
      OptionIsEmptyError,
    );
  });

  it("Returns the contained value when unwrap() is called with a value value in the Option<T>", () => {
    const optionValue = option.some(3);

    expect(optionValue.unwrap()).toEqual(3);
  });

  it("Returns the contained value when unwrapOrDefault() is called with a valid value in the Option<T>", () => {
    const optionValue = option.some(3);

    expect(optionValue.unwrapOr(2)).toEqual(3);
  });

  it("Allows direct access of the value if the Option<T> is a Some<T>", () => {
    const optionValue = option.some(3);

    expect(optionValue).toHaveProperty("value");
  });

  it("Does not have the value property if the Option<T> is a None", () => {
    const optionValue = option.none();

    expect(optionValue).not.toHaveProperty("value");
  });

  it("Transforms the Option<T> into a Result Failure<E> when calling okOr() on a None type", () => {
    const optionValue = option.none();

    expect(optionValue.okOr(new Error()).isError()).toBeTruthy();
  });

  it("Transforms the Option<T> into a Result Success<T> with calling okOr() on a Some<T> type", () => {
    const optionValue = option.some(2);

    expect(optionValue.okOr(new Error()).isOk()).toBeTruthy();
  });

  it("Constructs a base Error class if okOr() is called with a string type", () => {
    const optionValue = option.none();

    expect(optionValue.okOr("This is an error").isError()).toBeTruthy();
  });

  it("Throws an error using the provided message when calling expect() on a None type", () => {
    const optionValue = option.none();

    expect(() => optionValue.expect("This is an error")).toThrow(
      "This is an error",
    );
  });

  it("Doesn't throw an error when calling expect() on a Some<T> type", () => {
    const optionValue = option.some(2);

    expect(() => optionValue.expect("This is an error")).not.toThrow();
  });

  it("Returns a None type if map() is called on an existing None type", () => {
    const optionValue = option.none<number>();

    expect(optionValue.map((value) => value + 1).isNone()).toBeTruthy();
  });

  it("Returns a Some<T> if map() is called on a Some<T> type, having applied the mapped function to the inner type", () => {
    const optionValue = option.some(1);

    expect(optionValue.map((value) => value + 1).unwrap()).toEqual(2);
  });

  it("Creates a serializable Option<T> when serialize() is called on an Option<T> type", () => {
    const optionValue = option.some(1);

    expect(optionValue.serialize()).toEqual({
      _marker: 0,
      value: 1,
    });

    const noneOptionValue = option.none();

    expect(noneOptionValue.serialize()).toEqual({
      _marker: 1,
    });
  });

  it("Converts a SerializableOption<T> back into an Option<T> when calling fromSerializableOption()", () => {
    const serializable = option.some(1).serialize();

    expect(option.fromSerializableOption(serializable).isSome()).toBeTruthy();

    const noneSerializable = option.none().serialize();

    expect(
      option.fromSerializableOption(noneSerializable).isNone(),
    ).toBeTruthy();
  });

  it("Returns a None type if `fromSerializableOption()` is called with no object or undefined", () => {
    const result = option.fromSerializableOption(undefined);

    expect(result.isNone()).toBeTruthy();
  });

  it.each([[1], [{}], ["testString"], [[]]])(
    "Returns a None type if `fromSerializableOption()` is called with a non-Option<T> type",
    (testValue) => {
      const result = option.fromSerializableOption(testValue as never);

      expect(result.isNone()).toBeTruthy();
    },
  );

  it("Performs andThen on a Some<T> type, returning a new Option<NewT>", () => {
    const optionValue = option.some(1);

    const newOption = optionValue.andThen((val) => option.some(val + 1));

    expect(newOption.unwrap()).toEqual(2);
  });

  it("Does not perform andThen on a None type, returning a None type", () => {
    const optionValue = option.none<number>();

    const newOption = optionValue.andThen((val) => option.some(val + 1));

    expect(newOption.isNone()).toBeTruthy();
  });

  it("Constructs an Option<T> type from an unknown value, returning a Some<T> if the value is not null or undefined, otherwise returning None", () => {
    const testValue = "test";
    const result = option.unknown(testValue);
    expect(result.isSome()).toBeTruthy();
    expect(result.unwrap()).toEqual(testValue);
    const nullValue: unknown = null;
    const nullResult = option.unknown(nullValue);
    expect(nullResult.isNone()).toBeTruthy();
  });

  it.each([
    ["option.some", option.some(123), option.isSome as (val: any) => boolean],
    [
      "option.some.serialize",
      option.some(123).serialize(),
      option.isSome as (val: any) => boolean,
    ],
    ["option.none", option.none(), option.isNone as (val: any) => boolean],
    [
      "option.none.serialize",
      option.none().serialize(),
      option.isNone as (val: any) => boolean,
    ],
  ])("Properly checks the return type of %s", (_, optVal, validator) => {
    expect(validator(optVal)).toBeTruthy();
  });

  it("Returns `undefined` if unsafeUnwrap() was called on a None type", () => {
    const opt = option.unknown(undefined);

    expect(opt.unsafeUnwrap()).toEqual(undefined);
  });

  it("returns the raw default value if unsafeUnwrapOr() was called on a None type", () => {
    const opt = option.unknown(undefined);

    expect(opt.unsafeUnwrapOr(null)).toEqual(null);
  });
});
