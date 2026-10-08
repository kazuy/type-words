export function normalizePracticeText(text: string): string {
  return text.replace(/['"‘’“”＇＂]/g, "");
}

export function isMatchingCharacter(input: string, target: string): boolean {
  return input.toLowerCase() === target.toLowerCase();
}

export function filterTypingInput(text: string): string {
  return text.replace(/[^\x20-\x7e]/g, "");
}

export function checkTypingAnswer(input: string, target: string) {
  const mismatchPositions = Array.from(input).flatMap((character, index) =>
    index < target.length && isMatchingCharacter(character, target[index])
      ? []
      : [index + 1],
  );

  return {
    mismatchPositions,
    complete: input.length === target.length && mismatchPositions.length === 0,
  };
}
