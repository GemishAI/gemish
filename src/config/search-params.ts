import {  parseAsString, createSearchParamsCache } from 'nuqs/server'
 

export const searchParams = {
  chat: parseAsString.withDefault('').withOptions({
    shallow: false
  })
}
 
export const loadSearchParams = createSearchParamsCache(searchParams)