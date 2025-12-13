'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamic import to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Fetch the OpenAPI spec from the API route
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error('Failed to load API spec:', error));
  }, []);

  if (!spec) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading API Documentation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Samyang Viral Insight Agent - API Documentation
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          AI-powered trend analysis and creator matching platform for Samyang Foods global
          SNS marketing
        </p>
      </div>
      <SwaggerUI spec={spec} />
    </div>
  );
}
