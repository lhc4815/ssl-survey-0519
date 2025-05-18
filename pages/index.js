import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  // Client-side redirect using Next.js router
  useEffect(() => {
    router.replace('/docs/index.html');
  }, [router]);
  
  // Fallback content in case redirect doesn't work
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>SSL 설문조사</h1>
      <p>리다이렉팅 중...</p>
      <p>자동으로 이동하지 않으면 <a href="/docs/index.html">여기를 클릭하세요</a></p>
      
      {/* Fallback meta redirect */}
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/docs/index.html" />
      </noscript>
    </div>
  );
}
