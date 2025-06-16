import express from 'express'
import apiRoutes from './routes/index'
import swaggerLoader from './utils/swaggerLoader'
import cors from 'cors'

export const app = express()
app.use(cors())

swaggerLoader(app)

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())
app.use('/api', apiRoutes)
