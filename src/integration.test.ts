import { option, result, Option, Result } from ".";

describe("Integration tests for result and option types", () => {
  it.each([
    [option.some(1), true, 1],
    [option.none<number>(), false, null],
  ])(
    "Can convert an Option<T> to a Result<T, E> with okOr()",
    (opt, isOk, innerVal) => {
      const resultValue = opt.okOr("This is an error");

      expect(resultValue.isOk()).toEqual(isOk);
      if (innerVal) {
        expect(resultValue.unwrap()).toEqual(innerVal);
      }
    }
  );

  it("Can do a complex map of an Option<T> to a Result<T, Error>", async () => {
    function addAsync(num: number): Promise<number> {
      return Promise.resolve(num + 1);
    }

    const optValue = option.some(123);

    const resultingValue = await result.fromPromise(
      optValue.okOr("No value").mapOk(addAsync)
    );

    expect(resultingValue.isOk()).toBeTruthy();
    expect(resultingValue.unwrap()).toEqual(124);
  });
});
