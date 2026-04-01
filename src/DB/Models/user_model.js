import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RollEnum } from "../../Utils/enums/Enums.js";

const UserSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: true,
      min: [3, "min length must be more then 3 chars"],
      max: [12, "max length must be lees then 12 chars"],
      trim: true,
    },
    LastName: {
      type: String,
      required: true,
      min: [3, "min length must be more then 3 chars"],
      max: [12, "max length must be lees then 12 chars"],
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: function () {
        return this.Providers == ProviderEnum.system;
      },
    },
    Phone: String,
    // enumes
    Roll: {
      type: Number,
      enum: Object.values(RollEnum),
      default: RollEnum.User,
    },
    Gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    Providers: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.system,
    },
    // Pictcher
    ProfilePictcher: String,
    CoverPictchers: [String],
    // Date
    ConfirmEmail: Date,
    ChangeCredentials: Date,
  },
  {
    collection: "User_Collection",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: true,
  },
);

const UserModule = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModule;
