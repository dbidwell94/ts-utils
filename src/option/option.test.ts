import { OptionIsEmptyError, option } from ".";

describe("src/utility/option.ts", () => {
  describe("some", () => {
    it("Constructs an Option<T> type with a provided value", () => {
      const optionValue = option.some(1);

      expect(optionValue.isSome()).toBeTruthy();
    });
  });

  describe("none", () => {
    it("Constructs an Option<T> with no provided value", () => {
      const optionValue = option.none();

      expect(optionValue.isNone()).toBeTruthy();
    });
  });

  describe("unwrap", () => {
    it("Throws an error on unwrap() if the Option<T> is empty", () => {
      const optionValue = option.none();

      expect(() => optionValue.unwrap()).toThrow(OptionIsEmptyError);
    });

    it("Returns the inner value if called on a Some variant", () => {
      const optValue = option.some(123);

      expect(() => optValue.unwrap()).not.toThrow();

      expect(optValue.unwrap()).toEqual(123);
    });
  });

  describe("unwrapOr", () => {
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

    it("Returns the contained value when called with a valid value in the Option<T>", () => {
      const optionValue = option.some(3);

      expect(optionValue.unwrapOr(2)).toEqual(3);
    });
  });

  describe("option.value", () => {
    it("Allows direct access of the value if the Option<T> is a Some<T>", () => {
      const optionValue = option.some(3);

      expect(optionValue).toHaveProperty("value");
    });

    it("Does not have the value property if the Option<T> is a None", () => {
      const optionValue = option.none();

      expect(optionValue).not.toHaveProperty("value");
    });
  });

  describe("okOr", () => {
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
  });

  describe("expect", () => {
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
  });

  describe("inspect", () => {
    it("calls the callback if called on a Some variant", () => {
      const spy = jest.fn();
      option.some(123).inspect((val) => spy(val));

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(123);
    });

    it("does not call the callback if called on a None variant", () => {
      const spy = jest.fn();
      option.none<number>().inspect((val) => spy(val));

      expect(spy).not.toHaveBeenCalled();
    });

    it("returns the same instance when called on a Some variant", () => {
      const spy = jest.fn();
      const opt = option.some(123);
      const inspectOpt = opt.inspect((val) => spy(val));

      expect(spy).toHaveBeenCalledWith(123);
      expect(opt).toEqual(inspectOpt);
    });

    it("returns the same instance when called on a None variant", () => {
      const spy = jest.fn();
      const opt = option.none<number>();
      const inspectOpt = opt.inspect((val) => spy(val));

      expect(spy).not.toHaveBeenCalled();
      expect(opt).toEqual(inspectOpt);
    });
  });

  describe("flatten", () => {
    it("Returns `None` if the Option is empty", () => {
      const optValue = option.none<number>();
      expect(optValue.flatten().isNone()).toBeTruthy();
    });

    it("Returns `Some` with a non-nested Option", () => {
      const optValue = option.some(1);
      expect(optValue.flatten().unsafeUnwrap()).toEqual(1);
    });

    it("Flattens out a nested Option and returns None if any properties are None", () => {
      const optValue = option.some({ one: 1, two: option.none<number>() });
      expect(optValue.flatten().isNone()).toBeTruthy();
    });

    it("Flattens out a nested Option and returns Some if all properties are Some", () => {
      const optValue = option.some({
        one: 1,
        two: option.some({
          three: 3,
        }),
      });

      const flattened = optValue.flatten();

      expect(flattened.isSome()).toBeTruthy();
      expect(flattened.unsafeUnwrap()).toEqual({
        one: 1,
        two: {
          three: 3,
        },
      });
    });

    it("Flattens out a highly deeply nested Option and returns None if any values are None", () => {
      const optValue = option.some({
        one: option.some({
          two: option.some({
            three: option.some({
              four: {
                five: {
                  six: option.some({
                    seven: option.none<number>(),
                  }),
                },
              },
            }),
          }),
        }),
      });

      const flattened = optValue.flatten();
      expect(flattened.isNone()).toBeTruthy();
    });

    it("Does not modify `null` or `undefined` if it is nested in an Option object", () => {
      const optValue = option.some({
        val1: 1,
        val2: null,
        val3: undefined,
        val4: option.some({
          val1: 1,
        }),
      });

      const flattened = optValue.flatten();
      expect(flattened.isSome()).toBeTruthy();
      expect(flattened.unsafeUnwrap()).toEqual({
        val1: 1,
        val2: null,
        val3: undefined,
        val4: {
          val1: 1,
        },
      });
    });
  });

  describe("map", () => {
    it("Returns a None type if map() is called on an existing None type", () => {
      const optionValue = option.none<number>();

      expect(optionValue.map((value) => value + 1).isNone()).toBeTruthy();
    });

    it("Returns a Some<T> if map() is called on a Some<T> type, having applied the mapped function to the inner type", () => {
      const optionValue = option.some(1);

      expect(optionValue.map((value) => value + 1).unwrap()).toEqual(2);
    });
  });

  describe("serialize", () => {
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
  });

  describe("fromSerializableOption", () => {
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
  });

  describe("andThen", () => {
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
  });

  describe("option.unknown", () => {
    it("Constructs an Option<T> type from an unknown value, returning a Some<T> if the value is not null or undefined, otherwise returning None", () => {
      const testValue = "test";
      const result = option.unknown(testValue);
      expect(result.isSome()).toBeTruthy();
      expect(result.unwrap()).toEqual(testValue);
      const nullValue: unknown = null;
      const nullResult = option.unknown(nullValue);
      expect(nullResult.isNone()).toBeTruthy();
    });
  });

  describe("option.isSome", () => {
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
  });

  describe("unsafeUnwrap", () => {
    it("Returns `undefined` if unsafeUnwrap() was called on a None type", () => {
      const opt = option.unknown(undefined);

      expect(opt.unsafeUnwrap()).toEqual(undefined);
    });

    it("Returns the inner value of Some<T> if unsafeUnwrap was called on a Some type", () => {
      const opt = option.some(123);

      expect(opt.unsafeUnwrap()).toEqual(123);
    });
  });

  describe("unsafeUnwrapOr", () => {
    it("returns the raw default value if unsafeUnwrapOr() was called on a None type", () => {
      const opt = option.unknown(undefined);

      expect(opt.unsafeUnwrapOr(null)).toEqual(null);
    });

    it("Returns the inner value of Some<T> if unsafeUnwrapOr() was called on a Some<T> type", () => {
      const opt = option.some(123);

      expect(opt.unsafeUnwrapOr(null)).toEqual(123);
    });
  });
});
