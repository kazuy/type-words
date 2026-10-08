import { getTypingWords, isMatchingCharacter } from "../domain/practice/typing";

type Props = { target: string; input: string; cursor: number };

export default function TypingCharacters({ target, input, cursor }: Props) {
  const words = getTypingWords(target);

  return (
    <label
      className="typing-characters"
      htmlFor="typing-input"
      aria-hidden="true"
    >
      {words.map((word) => (
        <span key={word.id} className="typing-word">
          {word.characters.map(({ id, character, index }) => {
            const typed = input[index];
            const correct =
              typed !== undefined && isMatchingCharacter(typed, character);
            const displayed =
              typed === undefined ? "_" : correct ? character : typed;

            return (
              <span
                key={id}
                className={`typing-character ${typed === undefined ? "untyped" : correct ? "correct" : "incorrect"} ${index === cursor ? "current" : ""}`}
              >
                {displayed}
                {typed === undefined &&
                  (character === "," || character === ".") && (
                    <span className="punctuation-hint">{character}</span>
                  )}
              </span>
            );
          })}
        </span>
      ))}
    </label>
  );
}
