# Typescript Rust-Like Utility Types

A Typescript library that provides utility types inspired by Rust's powerful type
system, including `Result<T, E>` and `Option<T>`. These types help to enhance
type safety and improve error handling in Typescript applications.

## Installation

You can install the library via `npm`:

```bash
npm i @dbidwell94/ts-utils
```

```bash
yarn add @dbidwell94/ts-utils
```

```bash
pnpm add @dbidwell94/ts-utils
```

## Documentation

Documentation is provided via `typedoc` and is published [on GitHub Pages](https://dbidwell94.github.io/ts-utils/)

## Quick Start

### Option

```ts
import { option, Option } from "@dbidwell94/ts-utils";

const myOption = option.some(123);

function doSomethingWithOptions(optionParam: Option<number>) {
  if (optionParam.isSome()) {
    console.log(`Option value is ${optionParam.value}`);
  } else {
    console.log("The provided Option has no value");
  }
}

doSomethingWithOptions(myOption); // Option value is 123
doSomethingWithOptions(option.none()); // The provided Option has no value

function doSomethingNullishValue(val: number | null | undefined) {
  doSomethingWithOptions(option.unknown(val));
}

doSomethingNullishValue(null); // The provided Option has no value
```

### Result

```ts
import { result, Result } from "@dbidwell94/ts-utils";

const myResult = result.ok(123);

function doSomethingWithResult(resultParam: Result<number>) {
  if (resultParam.isOk()) {
    console.log(`The provided value was ${resultParam.value}`);
  } else {
    console.log(
      `The provided Result errored with ${resultParam.error.toString()}`,
    );
  }
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if
you'd like to add features or fix bugs.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.

## Acknowledgements

Inspired by the elegant type system of Rust, this library aims to bring similar
concepts to Typescript for improved type safety and error handling.
