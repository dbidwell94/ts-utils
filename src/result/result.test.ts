import { UnknownError, result } from ".";

class NewErrorClass extends Error {
  constructor() {
    super();
  }
}
describe("src/utility/result.ts", () => {
  describe("unwrap", () => {
    it("Calling unwrap() on a Success<T> provides the Success<T> value", () => {
      const resultValue = result.ok(1);

      expect(resultValue.unwrap()).toEqual(1);
    });

    it("Calling unwrap() on a Failure<E> provides the Failure<E> error", () => {
      const resultValue = result.err(new NewErrorClass());

      expect(() => resultValue.unwrap()).toThrow(NewErrorClass);
    });
  });

  describe("isOk", () => {
    it("Returns if the Result<T, E> is a Success<T>", () => {
      const resultValue = result.ok(3);

      expect(resultValue.isOk()).toBeTruthy();
    });
  });

  describe("isError", () => {
    it("Returns if the Result<T, E> is a Failure<E>", () => {
      const resultValue = result.err(new Error());

      expect(resultValue.isError()).toBeTruthy();
    });
  });

  describe("unwrapOr", () => {
    it("Provides a defaultValue when unwrapOr() is called on a Failure<E> type", () => {
      const resultValue = result.err(new Error());

      expect(resultValue.unwrapOr(2)).toEqual(2);
    });

    it("Provides the Success<T> value if unwrapOr() is called on a Success<T> type", () => {
      const resultValue = result.ok(2);

      expect(resultValue.unwrapOr(5)).toEqual(2);
    });
  });

  describe("unwrapOrElse", () => {
    it("Throws the supplied Error if unwrapOrElse() is called on a Failure<E> type", () => {
      const resultValue = result.err(new Error());

      expect(() => resultValue.unwrapOrElse(new NewErrorClass())).toThrow(
        NewErrorClass,
      );
    });

    it("Provides the Success<T> value if unwrapOrElse() is called on a Success<T> type", () => {
      const resultValue = result.ok(3);

      expect(resultValue.unwrapOrElse(new NewErrorClass())).toEqual(3);
    });
  });

  describe("ok", () => {
    it("Converts the Success<T> to an Option<T> if ok() is called on a Success<T> type", () => {
      const resultValue = result.ok(3);

      expect(resultValue.ok().isSome()).toBeTruthy();
    });

    it("Converts the Failure<E> to an Option<T> if ok() is called on a Failure<E> type", () => {
      const resultValue = result.err(new Error());

      expect(resultValue.ok().isNone()).toBeTruthy();
    });
  });

  describe("err", () => {
    it("Converts the Success<T> to an Option<E> if err() is called on a Success<T> type", () => {
      const resultValue = result.ok(2);

      expect(resultValue.err().isNone()).toBeTruthy();
    });

    it("Converts the Failure<E> to an Option<E> if err() is called on a Failure<E> type", () => {
      const resultValue = result.err(new Error());

      expect(resultValue.err().isSome()).toBeTruthy();
    });
  });

  describe("mapOk", () => {
    it("Maps the Success<T> value to a new value if mapOk() is called on a Success<T> type", () => {
      const resultValue = result.ok(2);

      expect(resultValue.mapOk((x) => x.toString()).unwrap()).toEqual("2");
    });

    it("Does not map the Success<T> value if mapOk() is called on a Failure<E> type", () => {
      const resultValue = result.err<number>(new Error());

      expect(resultValue.mapOk((x) => x * 2).isError()).toBeTruthy();
    });
  });

  describe("mapErr", () => {
    it("Maps the Failure<E> error to a new error if mapErr() is called on a Failure<E> type", () => {
      const resultValue = result.err(new Error());

      expect(
        resultValue.mapErr(() => new NewErrorClass()).isError(),
      ).toBeTruthy();
    });

    it("Does not map the Failure<E> error if mapErr() is called on a Success<T> type", () => {
      const resultValue = result.ok(2);

      expect(resultValue.mapErr(() => new NewErrorClass()).isOk()).toBeTruthy();
    });
  });

  describe("andThen", () => {
    it("Maps the Success<T> value to a new Result<NewT, E> if andThen() is called on a Success<T> type", () => {
      const resultValue = result.ok(2);

      expect(
        resultValue.andThen((x) => result.ok(x.toString())).unwrap(),
      ).toEqual("2");
    });

    it("Does not map the Success<T> value if andThen() is called on a Failure<E> type", () => {
      const resultValue = result.err<number>(new Error());

      expect(
        resultValue.andThen((x) => result.ok(x * 2)).isError(),
      ).toBeTruthy();
    });
  });

  describe("err Constructor", () => {
    it("Constructs a Failire<E> error with a default Error if provided with a string instead of an Error", () => {
      const resultValue = result.err("This is an error");

      expect(() => resultValue.unwrap()).toThrow(Error);
    });

    it("Constructs a Failure<E> error with an Error with no message if err() is called with no parameters", () => {
      const resultValue = result.err();

      expect(() => resultValue.unwrap()).toThrow(Error);
    });
  });

  describe("fromPromise", () => {
    it("Constructs a Result<T> from a promise when calling fromPromise() with a promise that resolves", async () => {
      const resultValue = await result.fromPromise(Promise.resolve(3));

      expect(resultValue.unwrap()).toEqual(3);
    });

    it("Constructs a Result<T> from a promise when calling fromPromise() with a promise that rejects", async () => {
      const resultValue = await result.fromPromise(
        Promise.reject(new NewErrorClass()),
      );

      expect(() => resultValue.unwrap()).toThrow(NewErrorClass);
    });

    it("Constructs a Result<T> from a promise that throws something other than an Error", async () => {
      const resultValue = await result.fromPromise(Promise.reject(2));

      expect(() => resultValue.unwrap()).toThrow(UnknownError);
    });

    it("Constructs a Result<T, E> from a Result containing a promise that resolves", async () => {
      const resultValue = result.ok(Promise.resolve(3));

      const finalResult = await result.fromPromise(resultValue);

      expect(finalResult.unwrap()).toEqual(3);
    });

    it("Constructs a Result<T, E> from a Result containing a promise that rejects", async () => {
      const resultValue = result.ok(Promise.reject(new NewErrorClass()));

      const finalResult = await result.fromPromise(resultValue);

      expect(() => finalResult.unwrap()).toThrow(NewErrorClass);
    });

    it("Constructs a Result<T, E> from a Result that is of a Failure<E> type", async () => {
      const resultValue = result.err<Promise<number>>(new Error());

      const finalResult = await result.fromPromise(resultValue);

      expect(finalResult.isError()).toBeTruthy();
    });
  });

  describe("expect", () => {
    it("Does not throw if the Result is a Success variant", () => {
      const res = result.ok(2);

      expect(() => res.expect("Some Message")).not.toThrow();
    });

    it("Throws with the expected message if called on a Failure type", () => {
      const expectedMessage = "Some Message";
      const res = result.err<number>();

      expect(() => res.expect(expectedMessage)).toThrow(
        new Error(expectedMessage),
      );
    });
  });

  describe("inspect", () => {
    it("Calls the callback function if called on a Success variant", () => {
      const spy = jest.fn();
      const res = result.ok(123);
      res.inspect((value) => spy(value));

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(123);
    });

    it("Does not call callback function if called on a Failure variant", () => {
      const spy = jest.fn();
      const res = result.err<number>();

      res.inspect((value) => spy(value));

      expect(spy).not.toHaveBeenCalled();
    });

    it("Returns the same instance of Result when called with a Success variant", () => {
      const spy = jest.fn();
      const res = result.ok(123);
      const inspectRes = res.inspect((val) => spy(val));

      expect(spy).toHaveBeenCalledTimes(1);
      expect(inspectRes).toEqual(res);
    });

    it("Returns the same instance of Result when called with a Failure variant", () => {
      const spy = jest.fn();
      const res = result.err<number>();
      const inspectRes = res.inspect((val) => spy(val));

      expect(spy).not.toHaveBeenCalled();
      expect(inspectRes).toEqual(res);
    });
  });
});
