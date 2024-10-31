# TypeScript Rust-Like Utility Types

A TypeScript library that provides utility types inspired by Rust's powerful type system, including `Result<T, E>` and `Option<T>`. These types help to enhance type safety and improve error handling in TypeScript applications.

## Installation

You can install the library via npm:

```bash
npm install @dbidwell94/ts-utils 
```

## Usage

### Option<T>

The `Option<T>` type is used to represent a value that can either be `Some(value)` or `None`. This is useful for scenarios where a value may or may not be present.

```typescript
import { Option, option } from '@dbidwell94/ts-utils';

// Example usage
function findUserById(id: string): Option<User> {
    const user = database.find(user => user.id === id);
    return user ? option.some(user) : option.none();
}

const userOption = findUserById('123');

if (userOption.isSome()) {
    console.log(`Found user: ${userOption.value}`);
} else {
    console.log('User not found');
}
```

### Result<T, E>

The `Result<T, E>` type is used to represent the result of an operation that can either succeed with a value of type `T` or fail with an error of type `E`. This is ideal for handling operations that can fail.

```typescript
import { Result, result } from '@dbidwell94/ts-utils';

// Example usage
function divide(a: number, b: number): Result<number> { // Result<T> can be used instead of `Result<T, Error>`, however you can make the 2nd type param anything that extends `Error`
    if (b === 0) {
        return result.err("Cannot divide by zero");
    }
    return result.ok(a / b);
}

const divideResult = divide(10, 0);

if (divideResult.isOk()) {
    console.log(`Result: ${result.value}`);
} else {
    console.error(`Error: ${result.error}`);
}
```

## API Reference

### `Option<T>`

- `some(value: T)`: Represents a value that is present.
- `none()`: Represents the absence of a value.
- `isSome()`: Returns `true` if the option contains a value.
- `isNone()`: Returns `true` if the option does not contain a value.
- `unwrap()`: Returns the value contained in `Some`, or throws an error if it is `None`.
- `unwrapOr(err: E)`: Returns the value contained in `Some`, or throws the provided error if it is `None`.
- `map(newValue: NewT)`: Maps the value of `T` into a `NewT` if the provided value is `Some`.
- `serialize()`: Converts the `Option` into a serializable Option without any helper functions. Useful if you want to store the `Option` in Redux, or send the value over the net
- `fromSerializableOption(option: SerializableOption)`: Converts a `SerializableOption` into an `Option` with all the helper functions


### `Result<T, E>`

- `ok(value: T)`: Represents a successful result.
- `err(error: E)`: Represents a failed result.
- `isOk()`: Returns `true` if the result is successful.
- `isError()`: Returns `true` if the result is an error.
- `unwrap()`: Returns the value contained in `Ok`, or throws an error if it is `Err`.
- `unwrapOr(default: T)`: Returns the value contained in `Ok`, or returns the default value `T`.
- `unwrapOrElse(error: E)`: Returns the value contained in `Ok`, or throws the provided error `E`.
- `ok()`: Converts the `Result<T, E>` into an `Option<T>`.
- `err()`: Converts the `Result<T, E>` into an `Option<E>`.
- `mapOk(newValue: NewT)`: Maps the value of `T` into a `NewT`, returning a new `Result<NewT, E>`.
- `mapErr(newError: NewE)`: Maps the error `E` into a `NewE`, returning a new `Result<T, NewE>`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you'd like to add features or fix bugs.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Inspired by the elegant type system of Rust, this library aims to bring similar concepts to TypeScript for improved type safety and error handling.

