
// handleError
// Generic error handling for API requests
export const handleError = (res, err) => {
  return res.json(500, err).end()
}
