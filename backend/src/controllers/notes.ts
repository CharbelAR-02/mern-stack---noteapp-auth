import { RequestHandler } from "express";
import noteModel from "../models/note";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertsIsValid";

export const getNotes: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  //next argument passes the error to the global middleware defined at the bottom
  try {
    assertIsDefined(authenticatedUserId);

    // Attempt to retrieve notes from the database
    const notes = await noteModel.find({ userId: authenticatedUserId }).exec(); // find all records in the notes table

    // If successful, respond with a JSON array of notes
    res.status(200).json(notes);
  } catch (error) {
    // If an error occurs, pass it to the global error handling middleware
    next(error);
  }
};

export const getNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteId;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "invalid note id");
    }
    const note = await noteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(404, "note not found");
    }
    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(401, "You cannot access this Note");
    }
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

interface createNoteBody {
  title?: string;
  text?: string;
}
export const createNote: RequestHandler<
  unknown,
  unknown,
  createNoteBody,
  unknown
> = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!title) {
      throw createHttpError(400, "notes must have title");
    }
    const newNote = await noteModel.create({
      userId: authenticatedUserId,
      title: title,
      text: text,
    });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

interface updateNoteParams {
  noteId: string;
}

interface updateNoteBody {
  title?: string;
  text?: string;
}

export const updateNote: RequestHandler<
  updateNoteParams,
  unknown,
  updateNoteBody,
  unknown
> = async (req, res, next) => {
  const noteId = req.params.noteId;
  const newTitle = req.body.title;
  const newText = req.body.text;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "invalid note id");
    }
    if (!newTitle) {
      throw createHttpError(400, "notes must have title");
    }
    const note = await noteModel.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "note not found");
    }
    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(401, "You cannot access this Note");
    }

    note.title = newTitle;
    note.text = newText;

    const updatedNote = await note.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteId;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(400, "invalid note id");
    }
    const note = await noteModel.findById(noteId).exec();

    if (!note) {
      throw createHttpError(404, "note not found");
    }
    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(401, "You cannot access this Note");
    }
    const deleteResult = await noteModel.deleteOne({ _id: noteId }).exec();
    if (deleteResult.deletedCount === 0) {
      throw createHttpError(404, "Note not found");
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
