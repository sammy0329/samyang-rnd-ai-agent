# API Endpoint Test

Test API endpoints to verify they're working correctly.

## Instructions

Test the following API endpoints:

### 1. Health Check
```bash
curl -s http://localhost:3000/api/health | jq
```

### 2. Trends API
```bash
# List trends
curl -s "http://localhost:3000/api/trends?limit=5" | jq

# Analyze trend (POST)
curl -s -X POST http://localhost:3000/api/trends/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword": "test", "platform": "shorts", "country": "KR"}' | jq
```

### 3. Creators API
```bash
# List creators
curl -s "http://localhost:3000/api/creators?limit=5" | jq
```

### 4. Content Ideas API
```bash
# List content ideas
curl -s "http://localhost:3000/api/content-ideas?limit=5" | jq
```

### 5. Reports API
```bash
# List reports
curl -s "http://localhost:3000/api/reports?limit=5" | jq
```

## Output

Provide a summary of each endpoint:
- Status code
- Response time
- Sample response (truncated)
- Any errors encountered

Note: Make sure the development server is running (`pnpm dev`) before testing.
