# Sentry Setup Guide

This document provides instructions for setting up Sentry error tracking in the Samyang RnD AI Agent project.

## Installation

```bash
npm install @sentry/nextjs --save
```

## Configuration

### 1. Run Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js` with Sentry configuration

### 2. Environment Variables

Add the following to your `.env.local`:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Optional: Control error reporting
NEXT_PUBLIC_SENTRY_ENABLED=true
SENTRY_ENVIRONMENT=production
```

### 3. Manual Configuration (if wizard fails)

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set sample rates
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors

  // Environment
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  // Enable in production only (optional)
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',

  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

Create `sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
});
```

## Update Logger Integration

The logger system is already prepared for Sentry integration. Once Sentry is installed, uncomment the integration code in `src/lib/logger.ts`:

```typescript
// In the error() method, uncomment:
if (typeof window !== 'undefined' && window.Sentry) {
  window.Sentry.captureException(error, { contexts: { custom: context } });
}
```

## Testing Sentry

Add a test error button in development:

```tsx
<button onClick={() => {
  throw new Error('Test Sentry error!');
}}>
  Test Error
</button>
```

## Best Practices

1. **Set appropriate sample rates** - Don't capture 100% of transactions in production
2. **Filter sensitive data** - Use `beforeSend` to remove PII
3. **Tag errors properly** - Add custom tags for better filtering
4. **Set user context** - Identify users (without PII) for better debugging
5. **Monitor performance** - Use performance monitoring for slow operations

## Custom Error Tracking

Example usage with context:

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'trend-analysis',
      feature: 'ai-generation',
    },
    contexts: {
      trend: {
        keyword: 'ramyeon',
        platform: 'youtube',
      },
    },
  });
}
```

## Performance Monitoring

Track custom transactions:

```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'AI Trend Analysis',
  op: 'ai.analysis',
});

try {
  // Your AI operation
  const result = await analyzeTrend(input);

  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## Vercel Integration

If deploying to Vercel:

1. Install Sentry integration in Vercel dashboard
2. Add environment variables to Vercel project settings
3. Sentry will automatically capture build and deployment information

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/nextjs/usage/error-boundaries/)
