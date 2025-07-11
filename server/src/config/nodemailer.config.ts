import nodemailer from 'nodemailer'
import dotenv from "dotenv"

dotenv.config()

export const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})
