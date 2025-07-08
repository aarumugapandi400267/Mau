import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import functionalRoutes from './routes/functional.route'
import { logger, connectDB } from './config';
import agenda from './utils/agenda.util';

dotenv.config({
  path: ".env"
})

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/api", functionalRoutes)

app.get('/', (req, res) => {
  logger.info("Ok")
  res.send('Hello from TypeScript server!');
});

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    agenda.start();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    })
  })
  .catch((err) => {
    logger.error("Failed to Connect to DB")
    process.exit(1)
  })
