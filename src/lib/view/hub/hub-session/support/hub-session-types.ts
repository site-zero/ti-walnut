export type WnUserRace = "SYS" | "DOMAIN";

export function isWnUserRace(input: any): input is WnUserRace {
  return /^(SYS|DOMAIN)$/.test(input);
}

export function toWnUserRace(input: any): WnUserRace | undefined {
  if (isWnUserRace(input)) {
    return input;
  }
  throw new Error(`Invalid WnUserRace value: ${input}`);
}
