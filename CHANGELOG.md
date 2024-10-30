# Changelog

## [0.2.1]

- Add new utility function `mapOk()` to allow mapping
  a `Success<T>` Result type to a new type, leaving
  the `Failure<E>` alone.

- Add new utility function `mapErr()` to allow mapping
  a `Failure<E>` Result type to a new type, leaving
  the `Success<T>` alone.

## [0.3.0]

- Added the ability to invoke `err` with a string type,
  resulting in a `Result<T, Error>`

## [0.4.0]

- Added a default export to both result and option
- Added ability to call result.err with no parameters
- Added utility function `fromPromise`

## [0.4.1]

- Changed the imports to better integrate with the CI/CD pipeline
  - Option exported as `import { option } from '@dbidwell94/ts-utils'`
  - Result exported as `import { result } from '@dbidwell94/ts-utils'`
- Added documentation around the named result and option export namespaces
