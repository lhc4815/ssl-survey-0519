export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Basic API test is working',
    timestamp: new Date().toISOString()
  });
}
