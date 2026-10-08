export function normalizePracticeText(text: string): string {
  return text.replace(/['"‘’“”＇＂]/g, "");
}

export function isMatchingCharacter(input: string, target: string): boolean {
  return input.toLowerCase() === target.toLowerCase();
}

export function filterTypingInput(text: string): string {
  return text.replace(/[^\x21-\x7e]/g, "");
}

export function checkTypingAnswer(input: string, target: string) {
  const typingTarget = getTypingTarget(target);
  const mismatchPositions = Array.from(input).flatMap((character, index) =>
    index < typingTarget.length &&
    isMatchingCharacter(character, typingTarget[index])
      ? []
      : [index + 1],
  );

  return {
    mismatchPositions,
    complete:
      input.length === typingTarget.length && mismatchPositions.length === 0,
  };
}

export function getTypingTarget(target: string): string {
  return target.replace(/ /g, "");
}

export function getTypingWords(target: string) {
  let inputIndex = 0;

  return target
    .split(/ +/)
    .filter(Boolean)
    .map((word, wordIndex) => ({
      id: `${wordIndex}`,
      characters: Array.from(word, (character) => {
        const index = inputIndex++;

        return { id: `${index}`, character, index };
      }),
    }));
}
