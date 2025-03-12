import { parseAsString, createSearchParamsCache } from "nuqs/server";

export const searchParams = {
  chat: parseAsString.withDefault("").withOptions({
    shallow: false,
  }),
  nav: parseAsString.withDefault("account").withOptions({
    shallow: false,
  }),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
