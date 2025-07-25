import type { Application } from 'express'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import swaggerOptions from './swaggerOptions.ts'

const swaggerLoader = (app: Application): void => {
  const swaggerSpec = swaggerJsDoc(swaggerOptions)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

export default swaggerLoader
