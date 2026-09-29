import { ZodError } from 'zod';

export function notFoundHandler(_request, response) {
  response.status(404).json({ error: { message: 'Route not found.' } });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: {
        message: 'Request validation failed.',
        details: error.issues.flatMap((issue) => issue.code === 'unrecognized_keys'
          ? issue.keys.map((key) => ({ path: [...issue.path, key].join('.'), message: `Unrecognized field: ${key}.` }))
          : [{ path: issue.path.join('.'), message: issue.message }])
      }
    });
  }

  console.error(error);
  response.status(500).json({ error: { message: 'An unexpected server error occurred.' } });
}
