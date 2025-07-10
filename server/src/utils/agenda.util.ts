import Agenda from "agenda"
import { transport } from "../config";
import { logger } from "../config";
import {db} from "../config"

const agenda = new Agenda({
  processEvery: '30 seconds',
  db: {
    address: process.env.MONGOOSE_URI || "mongodb://localhost:27017/agenda",
    collection: 'agendaJobs'
  }
})

agenda.define('test-connection', async () => {
  logger.info("Agenda is connected to the database");
});

agenda.define('send_email', async (job: any) => {
  const { options } = job.attrs.data;
  const info=await transport.sendMail(options);
  logger.info('📧 Email sent '+info.response);
});

export default agenda;
