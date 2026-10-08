export function normalizePracticeText(text: string): string {
  return text.replace(/['"‘’“”＇＂]/g, "");
}

export function isMatchingCharacter(input: string, target: string): boolean {
  return input.toLowerCase() === target.toLowerCase();
}

export function filterTypingInput(text: string): string {
  return text.replace(/[^\x20-\x7e]/g, "");
}
