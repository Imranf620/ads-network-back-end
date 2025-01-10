import mongoose from "mongoose";

const filesSchema = new mongoose.Schema(
  {
    
    fileName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    password:{
      type: String,
    }
  },
  { timestamps: true } 
);

export default mongoose.model("File", filesSchema);
