import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: [true, "Please enter a domain"],
        unique: [true, "Domain already exists"],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type:{
        type: String,
        required: [true, "Please enter a type"],
    },
    assignedDomainAt:Date,
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    referenceTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
    },
    templateActive:{
        type: Boolean,
        default: true,
    }

},{
    timestamps: true,
})

export default mongoose.model("Domain", domainSchema)