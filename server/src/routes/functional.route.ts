import { Router } from "express";
import { getJobById, sendmail, createContact, sendUsingMau, getContacts, deleteContact, getJobs, deleteJob, undoDeletedContact } from "../controllers"

const router = Router();

router.post("/send-mail", sendmail);
router.post("/mau", sendUsingMau)

router.post("/create-contact", createContact)
router.get("/contacts", getContacts)
router.delete("/contact/:contactId", deleteContact)
router.patch("/contact/:contactId/undo", undoDeletedContact)

router.get("/jobs", getJobs)
router.get("/job/:jobId", getJobById)
router.delete("/job/:jobId", deleteJob)

export default router;
