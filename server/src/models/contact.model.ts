import mongoose,{Document, Mongoose} from "mongoose";

export interface Contact extends Document{
    name:string,
    email:string,
    embeddings:number[]
}

const ContactSchema:mongoose.Schema= new mongoose.Schema<Contact>({
    name:{type:String,required:true},
    email:{type:String,required:true},
    embeddings:{type:[Number],required:true}
})

export const Contact=mongoose.model("Contact",ContactSchema)

