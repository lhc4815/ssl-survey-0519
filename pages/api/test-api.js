// Simple test API to verify serverless functions are working
export default function handler(req, res) {
  // Set headers to avoid CORS issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  // Return a success response
  res.status(200).json({
    success: true,
    message: 'Test API is working correctly',
    timestamp: new Date().toISOString()
  });
}
