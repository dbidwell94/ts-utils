import { UnknownError, result } from ".";

class NewErrorClass extends Error {
  constructor() {
    super();
  }
}
describe("src/utility/result.ts", () => {
  it("Calling unwrap() on a Success<T> provides the Success<T> value", () => {
    const resultValue = result.ok(1);

    expect(resultValue.unwrap()).toEqual(1);
  });

  it("Calling unwrap() on a Failure<E> provides the Failure<E> error", () => {
    const resultValue = result.err(new NewErrorClass());

    expect(() => resultValue.unwrap()).toThrow(NewErrorClass);
  });

  it("Returns if the Result<T, E> is a Success<T>", () => {
    const resultValue = result.ok(3);

    expect(resultValue.isOk()).toBeTruthy();
  });

  it("Returns if the Result<T, E> is a Failure<E>", () => {
    const resultValue = result.err(new Error());

    expect(resultValue.isError()).toBeTruthy();
  });

  it("Provides a defaultValue when unwrapOr() is called on a Failure<E> type", () => {
    const resultValue = result.err(new Error());

    expect(resultValue.unwrapOr(2)).toEqual(2);
  });

  it("Provides the Success<T> value if unwrapOr() is called on a Success<T> type", () => {
    const resultValue = result.ok(2);

    expect(resultValue.unwrapOr(5)).toEqual(2);
  });

  it("Throws the supplied Error if unwrapOrElse() is called on a Failure<E> type", () => {
    const resultValue = result.err(new Error());

    expect(() => resultValue.unwrapOrElse(new NewErrorClass())).toThrow(
      NewErrorClass
    );
  });

  it("Provides the Success<T> value if unwrapOrElse() is called on a Success<T> type", () => {
    const resultValue = result.ok(3);

    expect(resultValue.unwrapOrElse(new NewErrorClass())).toEqual(3);
  });

  it("Converts the Success<T> to an Option<T> if ok() is called on a Success<T> type", () => {
    const resultValue = result.ok(3);

    expect(resultValue.ok().isSome()).toBeTruthy();
  });

  it("Converts the Failure<E> to an Option<T> if ok() is called on a Failure<E> type", () => {
    const resultValue = result.err(new Error());

    expect(resultValue.ok().isNone()).toBeTruthy();
  });

  it("Converts the Success<T> to an Option<E> if err() is called on a Success<T> type", () => {
    const resultValue = result.ok(2);

    expect(resultValue.err().isNone()).toBeTruthy();
  });

  it("Converts the Failure<E> to an Option<E> if err() is called on a Failure<E> type", () => {
    const resultValue = result.err(new Error());

    expect(resultValue.err().isSome()).toBeTruthy();
  });

  it("Maps the Success<T> value to a new value if mapOk() is called on a Success<T> type", () => {
    const resultValue = result.ok(2);

    expect(resultValue.mapOk((x) => x.toString()).unwrap()).toEqual("2");
  });

  it("Does not map the Success<T> value if mapOk() is called on a Failure<E> type", () => {
    const resultValue = result.err<number>(new Error());

    expect(resultValue.mapOk((x) => x * 2).isError()).toBeTruthy();
  });

  it("Maps the Failure<E> error to a new error if mapErr() is called on a Failure<E> type", () => {
    const resultValue = result.err(new Error());

    expect(
      resultValue.mapErr(() => new NewErrorClass()).isError()
    ).toBeTruthy();
  });

  it("Does not map the Failure<E> error if mapErr() is called on a Success<T> type", () => {
    const resultValue = result.ok(2);

    expect(resultValue.mapErr(() => new NewErrorClass()).isOk()).toBeTruthy();
  });

  it("Constructs a Failire<E> error with a default Error if provided with a string instead of an Error", () => {
    const resultValue = result.err("This is an error");

    expect(() => resultValue.unwrap()).toThrow(Error);
  });

  it("Constructs a Failure<E> error with an Error with no message if err() is called with no parameters", () => {
    const resultValue = result.err();

    expect(() => resultValue.unwrap()).toThrow(Error);
  });

  it("Constructs a Result<T> from a promise when calling fromPromise() with a promise that resolves", async () => {
    const resultValue = await result.fromPromise(Promise.resolve(3));

    expect(resultValue.unwrap()).toEqual(3);
  });

  it("Constructs a Result<T> from a promise when calling fromPromise() with a promise that rejects", async () => {
    const resultValue = await result.fromPromise(
      Promise.reject(new NewErrorClass())
    );

    expect(() => resultValue.unwrap()).toThrow(NewErrorClass);
  });

  it("Constructs a Result<T> from a promise that throws something other than an Error", async () => {
    const resultValue = await result.fromPromise(Promise.reject(2));

    expect(() => resultValue.unwrap()).toThrow(UnknownError);
  });
});
