import { Request, Response } from "express"
import { Contact } from "../models"
import { contactCollection } from "../config"
import { logger } from "../config"
import { embeddingModel } from "../config/gemini.config"

interface ContactDetails {
    name: string,
    email: string
}

export const createContact = async (req: Request, res: Response): Promise<any> => {
    try {
        const contactDetails: ContactDetails = req.body.contactDetails

        const embeddingResponse = await embeddingModel.embedContent({
            content: {
                role: "user",
                parts: [
                    { text: `${contactDetails.name} ${contactDetails.email}` }
                ]
            }
        })

        const embeddings=embeddingResponse.embedding.values
        
        // const contact = await Contact.create({
        //     ...contactDetails,
        //     embeddings
        // })

        const contact= await contactCollection.insertOne({
            ...contactDetails,
            embeddings
        })
        
        logger.info("Contact Created Successfully")
        return res.status(201).json({
            message: "Contact Created Successfully " + contact.insertedId,
        })

    } catch (error) {
        logger.error("Error while Contact Creation", error)
        return res.status(500).json({
            message: "Error while Contact Creation: " + error
        })
    }
}

