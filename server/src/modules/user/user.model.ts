import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * User schema — represents a hostel resident.
 * Auth identity fields (email, rollNo) are indexed unique.
 * Profile fields (department, hostelName) support discovery + filters.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: { type: String, required: true, trim: true, index: true },
    hostelName: { type: String, required: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student", index: true },
    avatarUrl: { type: String },
  },
  { timestamps: true, versionKey: false },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const UserModel = model("User", userSchema);
