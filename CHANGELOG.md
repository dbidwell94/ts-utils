# Changelog

## [1.0.0]

- Removed multiple named exports from the base library in favor of
  one singular named export (e.g. `result` and `option`)
  - If using those named exports (e.g. `err()`) then you simply have to
    import the namespaced export and use it as an object. (e.g. `result.err()`)
    - `import {option, result} from '@dbidwell94/ts-utils';`

## [0.7.0]

- Added new "static" functions to help with `SerializableOption`
  - `option.isSome(val)`
  - `option.isNone(val)`

## [0.6.3]

- Update dev-dependencies to latest versions to resolve audit issues
  - Update `ts-jest` to version 29.2.6
  - Update `typescript` to version 5.8.2

## [0.6.2]

- Refactor `unknown` function signature to accept optional or null parameters
  - This change allows for more flexible usage of the `unknown` function when
    dealing with potentially null or undefined values
- Add documentation for the `unknown` function

## [0.6.1]

- Add new utility function `unknown` to the `Option` namespace
  - This function constructs an `Option<T>` type from an unknown value,
    returning a `Some<T>` if the value is not null or undefined, otherwise
    returning `None`

## [0.6.0]

- Add new utility function `andThen` for both `Result` and `Option` types
- Added function overload for `fromPromise` which will convert a
  `Result<Promise<T>, E>` to a `Promise<Result<T, E>>`

## [0.5.2]

- Upgrade dev dependencies and fix dev audit issue

## [0.5.1]

- Update CI/CD publish workflow (No code functionality changes)

## [0.5.0]

- Changed function signature of `fromSerializableOption` to accept a possibly
  undefined object
  - If undefined is provided, a `None` type is returned.
- Changed conditional for `fromSerializableOption` to be more resilient with
  possibly bad types passed as a parameter

## [0.4.1]

- Changed the imports to better integrate with the CI/CD pipeline
  - Option exported as `import { option } from '@dbidwell94/ts-utils'`
  - Result exported as `import { result } from '@dbidwell94/ts-utils'`
- Added documentation around the named result and option export namespaces

## [0.4.0]

- Added a default export to both result and option
- Added ability to call result.err with no parameters
- Added utility function `fromPromise`

## [0.3.0]

- Added the ability to invoke `err` with a string type,
  resulting in a `Result<T, Error>`

## [0.2.1]

- Add new utility function `mapOk()` to allow mapping
  a `Success<T>` Result type to a new type, leaving
  the `Failure<E>` alone.

- Add new utility function `mapErr()` to allow mapping
  a `Failure<E>` Result type to a new type, leaving
  the `Success<T>` alone.
