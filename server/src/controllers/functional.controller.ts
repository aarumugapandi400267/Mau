import { Request, Response } from "express"
// import { Contact } from "../models"
import { contactCollection } from "../config"
import { logger } from "../config"
import { embeddingModel } from "../config/gemini.config"
import { ObjectId } from "mongodb"
import { log } from "console"

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

        const embeddings = embeddingResponse.embedding.values

        // const contact = await Contact.create({
        //     ...contactDetails,
        //     embeddings
        // })

        const contact = await contactCollection.insertOne({
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

export const getContacts = async (req: Request, res: Response): Promise<any> => {
    try {
        const contacts = await contactCollection.find({}, {
            projection: {
                name: 1, email: 1
            }
        }).toArray()

        logger.info("Contacts fetched successfully");

        return res.status(200).json({
            message: "Contacts fetched successfully",
            data: contacts
        })

    } catch (error) {
        logger.error("Error while fetching contacts", error)
        return res.status(500).json({
            message: "Error while fetching contacts: " + error
        })
    }
}

export const deleteContact = async (req: Request, res: Response): Promise<any> => {
    try {
        const { contactId } = req.params

        const response = await contactCollection.findOneAndUpdate(
            { _id: new ObjectId(contactId) },
            { $set: { deleted: true } } 
        );
        ;

        if (response?.deletedCount === 0) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        return res.status(200).json({
            message: "Contact deleted successfully"
        })
    } catch (error) {
        logger.error("Error while deleting contact", error)
        return res.status(500).json({
            message: "Error while deleting contact: " + error
        })
    }
}

export const undoDeletedContact = async (req: Request, res: Response): Promise<any> => {
    try {
        const { contactId } = req.params

        const response = await contactCollection.findOneAndUpdate(
            { _id: new ObjectId(contactId) },
            { $set: { deleted: false } } 
        );
        ;

        if (response?.deletedCount === 0) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        return res.status(200).json({
            message: "Contact Restored successfully"
        })
    } catch (error) {
        logger.error("Error while restoring contact", error)
        return res.status(500).json({
            message: "Error while restoring contact: " + error
        })
    }
}