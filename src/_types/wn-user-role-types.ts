import { Vars } from "@site0/tijs";

export type WnRole = "MEMBER" | "ADMIN" | "GUEST" | "BLOCK";

export function isWnRole(input: any): input is WnRole {
  return input && /^MEMBER|ADMIN|GUEST|BLOCK$/.test(input);
}

export function toWnRole(input: any): WnRole {
  if (isWnRole(input)) {
    return input;
  }
  return "BLOCK";
}

export function toWnRoles(input: Vars): Record<string, WnRole> {
  const re: Record<string, WnRole> = {};
  for (let k in input) {
    re[k] = toWnRole(input[k]);
  }
  return re;
}

export type WnUserRace = "SYS" | "DOMAIN";

export function isWnUserRace(input: any): input is WnUserRace {
  return input && /^SYS|DOMAIN$/.test(input);
}

export function toWnUserRace(input: any): WnUserRace | undefined {
  if (isWnUserRace(input)) {
    return input;
  }
}
