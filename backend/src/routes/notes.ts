import * as NotesController from "../controllers/notes"; // * this means all.
import express from "express";

const router = express.Router();
// Define a route for the root path ("/")
router.get("/", NotesController.getNotes);
router.get("/:noteId", NotesController.getNote);
router.post("/", NotesController.createNote);
router.patch("/:noteId", NotesController.updateNote);
router.delete("/:noteId", NotesController.deleteNote);
export default router;
