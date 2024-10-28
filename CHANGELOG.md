## [0.2.1]
- Add new utility function mapOk() to allow mapping a Success<T> Result type to a new type, leaving the Failure<E> alone.
- Add new utility function mapErr() to allow mapping a Failure<E> Result type to a new type, leaving the Success<T> alone.