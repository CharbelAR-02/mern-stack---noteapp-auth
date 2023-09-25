import styles from "../styles/note.module.css";
import { Card } from "react-bootstrap";
import { Note as NoteModel } from "../models/note";
import { formatDate } from "../utils/formatDate";
import { MdDelete } from "react-icons/md";
import styleUtils from "../styles/utils.module.css";
interface NoteProps {
  onNoteClicked: (note: NoteModel) => void;
  note: NoteModel;
  OnDeleteNoteClicked: (note: NoteModel) => void;
  className?: string;
}

const Note = ({
  note,
  className,
  OnDeleteNoteClicked,
  onNoteClicked,
}: NoteProps) => {
  const { title, createdAt, updatedAt, text } = note;
  let createdUpdatedText: string;
  if (updatedAt > createdAt) {
    createdUpdatedText = "Updated: " + formatDate(updatedAt);
  } else {
    createdUpdatedText = "Created: " + formatDate(createdAt);
  }
  return (
    <Card
      className={`${styles.noteCard} ${className}`}
      onClick={() => onNoteClicked(note)}
    >
      <Card.Body className={styles.cardBody}>
        <Card.Title className={`${styleUtils.flexCenter} `}>
          {title}
          <MdDelete
            className="text-muted ms-auto"
            onClick={(e) => {
              OnDeleteNoteClicked(note);
              e.stopPropagation();
            }}
          />
        </Card.Title>
        <Card.Text className={styles.cardText}>{text}</Card.Text>
      </Card.Body>
      <Card.Footer className="text-muted">{createdUpdatedText}</Card.Footer>
    </Card>
  );
};

export default Note;
