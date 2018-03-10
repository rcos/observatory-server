
// handleError
// Generic error handling for API requests
export const handleError = (res, err) => {
  return res.send(500, err);
}
