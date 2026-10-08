import { isMatchingCharacter } from "../domain/practice/typing";

type Props = { target: string; input: string; cursor: number };

export default function TypingCharacters({ target, input, cursor }: Props) {
  const positions = Array.from(target, (character, index) => ({
    id: `${index}`,
    character,
    index,
  }));

  return (
    <label
      className="typing-characters"
      htmlFor="typing-input"
      aria-hidden="true"
    >
      {positions.map(({ id, character, index }) => {
        const typed = input[index];
        const correct =
          typed !== undefined && isMatchingCharacter(typed, character);
        const displayed =
          typed === undefined
            ? character === " "
              ? " "
              : "_"
            : correct
              ? character
              : typed;

        return (
          <span
            key={id}
            className={`typing-character ${typed === undefined ? "untyped" : correct ? "correct" : "incorrect"} ${index === cursor ? "current" : ""}`}
          >
            {displayed === " " ? "␣" : displayed}
          </span>
        );
      })}
    </label>
  );
}
