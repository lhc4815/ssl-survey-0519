// Root index.js for Vercel deployment
// This file helps redirect to the proper static files

module.exports = (req, res) => {
  // Redirect to the static index.html in the docs folder
  res.writeHead(302, { Location: '/docs/index.html' });
  res.end();
};
