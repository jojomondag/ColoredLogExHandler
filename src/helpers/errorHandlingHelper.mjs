import VError from 'verror';

export function createAndThrowVError(err) {
  const errorName = getErrorName(err);
  throw new VError({
    name: errorName,
    cause: err,
    info: { message: err.message }
  });
}