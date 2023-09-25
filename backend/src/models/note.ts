import { InferSchemaType, Schema, model } from "mongoose";

// Define the schema for the "Note" model
const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    // Define the "title" field with type String and as required
    title: { type: String, required: true },

    // Define the "text" field with type String (optional)
    text: { type: String },
  },
  { timestamps: true } // Enable automatic timestamping of "createdAt" and "updatedAt" fields
);

// Create a TypeScript type based on the schema
type Note = InferSchemaType<typeof noteSchema>; // this is for TypeScript

// Create and export the Mongoose model based on the schema
export default model<Note>("Note", noteSchema);
