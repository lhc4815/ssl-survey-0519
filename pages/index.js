// This is a placeholder page that will redirect to /docs/index.html
// The redirection is configured in next.config.js

// This component will never be rendered
export default function Home() {
  return (
    <div>
      <h1>Redirecting to main app...</h1>
      <p>If you're not redirected, <a href="/docs/index.html">click here</a></p>
    </div>
  );
}

// Server-side redirection as a fallback
export async function getServerSideProps({ res }) {
  if (res) {
    res.writeHead(302, { Location: '/docs/index.html' });
    res.end();
  }
  
  return { props: {} };
}
