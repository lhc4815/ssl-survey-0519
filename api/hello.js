// Simple API endpoint for testing Vercel serverless functions
module.exports = (req, res) => {
  res.status(200).json({
    message: 'API is working properly!',
    timestamp: new Date().toISOString()
  });
};
