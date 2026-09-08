/*
  Repliage des termes de recherche, côté navigateur.

  Transposition de ce que fait déjà `/store/search` en SQL : minuscules, sans accents. Le
  backend sélectionne les produits, ces fonctions décident ici quoi surligner et quelles
  rubriques proposer — les deux doivent donc s'accorder, sans quoi un résultat apparaîtrait
  sans qu'aucune lettre ne soit surlignée.

  Le repliage se fait caractère par caractère, et non sur la chaîne entière : la décomposition
  NFD d'un mot le rallonge d'un caractère par accent, et les positions trouvées ne
  désigneraient plus les bonnes lettres de l'original. Replié un à un, l'alignement reste
  exact — ce dont le surlignage dépend entièrement.
*/
const DIACRITICS = /[̀-ͯ]/g

export function fold(value: string): string {
  return value
    .split("")
    .map((char) => {
      const plain = char.normalize("NFD").replace(DIACRITICS, "").toLowerCase()
      // Une ligature se décompose en plusieurs lettres : la garder telle quelle préserve
      // l'alignement, au prix d'un surlignage manqué sur un cas que le catalogue n'a pas.
      return plain.length === 1 ? plain : char.toLowerCase()
    })
    .join("")
}

/** Mots cherchés, repliés et débarrassés de la ponctuation. */
export function searchWords(term: string): string[] {
  return fold(term)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/**
 * Les marques et les rubriques s'écrivent indifféremment en un ou deux mots — « Geekvape » sur
 * l'emballage, « Geek Vape » au catalogue. On compare donc aussi les formes sans espaces,
 * exactement comme le backend.
 */
export function matchesTerm(haystack: string, words: string[]): boolean {
  if (words.length === 0) return false

  const folded = fold(haystack)
  if (words.every((word) => folded.includes(word))) {
    return true
  }
  return folded.replace(/[^a-z0-9]/g, "").includes(words.join(""))
}
