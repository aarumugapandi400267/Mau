import Agenda from "agenda"
import { transport } from "../config";

const agenda = new Agenda({
  processEvery: '30 seconds',
  db: {
    address: process.env.MONGO_URI || ""
  }
})

agenda.define('send_email', async (job: any) => {
  console.log('Sending Email');
  const { options } = job.attrs.data;
  await transport.sendMail(options);
  console.log('📧 Email sent');
});

export default agenda;

