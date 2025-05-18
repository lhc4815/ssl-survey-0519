// Root index.js for Vercel deployment
// Simply redirect to the docs folder

module.exports = (req, res) => {
  // Set a simple cookie to track visitor
  res.setHeader('Set-Cookie', 'visited=true; Path=/; HttpOnly');
  
  // Redirect to the docs/index.html page
  res.writeHead(302, { Location: '/docs/index.html' });
  res.end();
};
