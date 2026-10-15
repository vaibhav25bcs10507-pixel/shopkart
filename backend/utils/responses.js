// Small shared response shapes used by more than one controller,
// so the wording and status codes stay identical everywhere.

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message
  });
}

function sendProductNotFound(res) {
  return sendError(res, 404, 'Product not found');
}

function sendNotAuthenticated(res) {
  return sendError(res, 401, 'Not authenticated');
}

module.exports = {
  sendError,
  sendProductNotFound,
  sendNotAuthenticated
};
