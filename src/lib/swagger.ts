import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Samyang Viral Insight Agent API',
      version: '1.0.0',
      description:
        'AI-powered trend analysis and creator matching platform for Samyang Foods global SNS marketing',
      contact: {
        name: 'API Support',
        email: 'support@samyang-agent.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://samyang-rnd-ai-agent.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'password123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
            token: {
              type: 'string',
              description: 'JWT token',
            },
          },
        },
        TrendAnalysisRequest: {
          type: 'object',
          required: ['keyword', 'platform', 'country'],
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword for trend analysis',
              example: 'mukbang',
            },
            platform: {
              type: 'string',
              enum: ['tiktok', 'reels', 'shorts'],
              description: 'Social media platform',
              example: 'tiktok',
            },
            country: {
              type: 'string',
              enum: ['KR', 'US', 'JP'],
              description: 'Target country',
              example: 'KR',
            },
          },
        },
        TrendAnalysisResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            keyword: { type: 'string' },
            platform: { type: 'string' },
            country: { type: 'string' },
            trends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  views: { type: 'number' },
                  engagement: { type: 'number' },
                  hashtags: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
            analysis: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                insights: {
                  type: 'array',
                  items: { type: 'string' },
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Trends',
        description: 'Trend analysis endpoints',
      },
      {
        name: 'Creators',
        description: 'Creator matching endpoints',
      },
      {
        name: 'Content',
        description: 'Content generation endpoints',
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
