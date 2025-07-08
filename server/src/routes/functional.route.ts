import { Router } from "express";
import { sendmail, createContact, sendUsingMau} from "../controllers"

const router = Router();

router.post("/send-mail", sendmail);
router.post("/mau",sendUsingMau)
router.post("/create-contact",createContact)

export default router;
