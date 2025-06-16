import path from 'node:path'
import type { Options } from 'swagger-jsdoc'

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Integrador',
      version: '1.0.0',
      description: 'Documentación Swagger de la API'
    },
    servers: [
      {
        url: 'http://localhost:3001'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    path.resolve(
      __dirname,
      '../config/swagger/swagger-response/*.yaml'
    )
  ]
}

export default swaggerOptions
