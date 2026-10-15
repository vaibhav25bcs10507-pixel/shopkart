// Handles requests to routes that don't exist
function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// Central error handler - any error passed to next(err) ends up here
function errorHandler(err, req, res, next) {
  // Malformed JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }

  // Mongoose schema validation failed (required, min, etc.)
  if (err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors)[0].message;
    return res.status(400).json({
      success: false,
      message: firstMessage
    });
  }

  // Mongoose could not cast a value (e.g. bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}`
    });
  }

  // MongoDB duplicate key (unique index) error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      message: field === 'email' ? 'Email already exists' : 'Duplicate value'
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
}

module.exports = { notFound, errorHandler };
