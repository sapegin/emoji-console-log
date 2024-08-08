/**
 * Checks an identifier:
 * tacoCat
 * taco.cat
 * taco['cat']
 * taco[13]
 * taco?.cat
 */
export const symbolRegExp = /[\w.?]+(\["[^"]+"])*(\['[^']+'])*(\[\d+])*/;
