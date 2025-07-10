import { Request, Response } from "express"
import { agendaCollection } from "../config"
import { logger } from "../config"
import { ObjectId } from "mongodb"

export const deleteJob = async (req: Request, res: Response): Promise<any> => {
    try {
        const { jobId } = req.params

        const response = await agendaCollection.deleteOne({
            _id: new ObjectId(jobId)
        })

        if (response?.deletedCount === 0) {
            return res.status(404).json({
                message: "Job not found"
            })
        }

        return res.status(200).json({
            message: "Job deleted successfully"
        })
    } catch (error) {
        logger.error("Error while deleting job", error)
        return res.status(500).json({
            message: "Error while deleting job: " + error
        })
    }
}

export const getJobById=async (req:Request,res:Response):Promise<any> => {
    try {
        const {jobId}=req.params

        const job= await agendaCollection.findOne({
            _id:new ObjectId(jobId)
        })

        res.status(200).json({
            message:"Job fetched successfully",
            data:job
        })
    } catch (error) {
        logger.error("Error while fetching job",error)
        res.status(500).json({
            message:"Error while fetching job: "+error
        })
    }
}

export const getJobs = async (req: Request, res: Response): Promise<any> =>{
    try {
        
        const jobs=await agendaCollection.find({},{
            projection:{
                data:0
            }
        }).toArray()

        logger.info("Jobs fetched successfully")
        
        return res.status(200).json({
            message:"Jobs fetched successfully",
            data:jobs
        })
    } catch (error) {
        logger.error("Error while fetching jobs",error)
        return res.status(500).json({
            message:"Error while fetching jobs: "+error
        })
    }
}