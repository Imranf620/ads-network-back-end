import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter a name"],
    },
    email: {
      type: String,
      required: [true, "please enter a valid email address"],
      unique: [true, "email already exists"],
      validate: [validator.isEmail, "please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minlength: [6, "password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    Cid: String,
    assignedDomain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
    },
    accountType: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    requestForAd: {
      type: Boolean,
      default: false,
    },
    allRequestsForAd: [
      {
        requestForAdAt: Date,
        domain: {
          type: String,
          required: true,
        },
        adType: {
          type: String,
          required: true,
        },
        domainDesc: {
          type: String,
          required: true,
        },
        approved: {
          type: Boolean,
          default: false,
        },
        assignedDomain:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Domain"
        },
        CId:String,
        approvedAt:Date
      },
    ],
    assignedDomainAt: Date,
    hashedId: String,
    resetPasswordToken: String,


    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);