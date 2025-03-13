import { createIdGenerator } from "ai";

export function IdGenerator(prefix: string) {
  const id = createIdGenerator({
    prefix,
    separator: "_",
  });

  const idString = id();
  return idString;
}
