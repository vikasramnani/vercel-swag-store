"use client";

// Runs in the browser. Two moments:
// 1. The shopper types. whenLettersChange updates the address.
// 2. The address changes. lettersToShowAfterTheAddressChanges updates the box.
// This file does not fetch. app/search/page.tsx reads the address and loads matches.

import { useState } from "react";
import { useRouter } from "next/navigation";

// "shi" becomes /search?search=shi.
// Under 3 characters, the word is left out and the page shows the default five.
// A chosen category stays in the address.
export function buildSearchAddress(typedWord: string, form: HTMLFormElement | null) {
  const selectedCategory = form
    ? String(new FormData(form).get("category") ?? "")
    : "";
  const params = new URLSearchParams();
  if (typedWord.length >= 3) params.set("search", typedWord);
  if (selectedCategory) params.set("category", selectedCategory);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

// Called only when the address changed. Each return is one shopper action.
function lettersToShowAfterTheAddressChanges(
  lettersInTheBox: string,
  oldAddressWord: string,
  newAddressWord: string,
) {
  // Back, or the Search link. The box still showed the old word, so follow the new address.
  if (lettersInTheBox === oldAddressWord) {
    return newAddressWord;
  }

  // Typed "shir" before the address caught up to "shi". Keep the extra letter.
  const typedFurtherThanTheAddress =
    newAddressWord.length > 0 &&
    lettersInTheBox.startsWith(newAddressWord) &&
    lettersInTheBox.length > newAddressWord.length;
  if (typedFurtherThanTheAddress) {
    return lettersInTheBox;
  }

  // Deleted "shi" down to "sh". Keep "sh" so the hint still has the letters.
  const deletedDownToOneOrTwoLetters =
    newAddressWord === "" && lettersInTheBox.length > 0 && lettersInTheBox.length < 3;
  if (deletedDownToOneOrTwoLetters) {
    return lettersInTheBox;
  }

  // A different word arrived, for example a shared link. Show that word.
  return newAddressWord;
}

export function SearchBox({ wordInTheAddress }: { wordInTheAddress: string }) {
  const router = useRouter();
  const [lettersInTheBox, setLettersInTheBox] = useState(wordInTheAddress);
  const [previousAddressWord, setPreviousAddressWord] = useState(wordInTheAddress);

  if (wordInTheAddress !== previousAddressWord) {
    const oldAddressWord = previousAddressWord;
    setPreviousAddressWord(wordInTheAddress);
    setLettersInTheBox(
      lettersToShowAfterTheAddressChanges(
        lettersInTheBox,
        oldAddressWord,
        wordInTheAddress,
      ),
    );
  }

  function whenLettersChange(event: React.ChangeEvent<HTMLInputElement>) {
    const lettersJustTyped = event.target.value;
    setLettersInTheBox(lettersJustTyped);
    const formAroundThisBox = event.currentTarget.form;
    const oneOrTwoCharacters =
      lettersJustTyped.length > 0 && lettersJustTyped.length < 3;

    if (oneOrTwoCharacters) {
      // Drop an old search so the default five return. Do not fetch for "s" or "sh".
      if (previousAddressWord.length > 0) {
        router.replace(buildSearchAddress("", formAroundThisBox));
      }
      return;
    }

    router.replace(buildSearchAddress(lettersJustTyped, formAroundThisBox));
  }

  const showTypeAtLeastThreeHint =
    lettersInTheBox.length > 0 &&
    lettersInTheBox.length < 3 &&
    wordInTheAddress !== lettersInTheBox;

  return (
    <div className="w-full sm:w-auto sm:flex-1">
      <input
        name="search"
        value={lettersInTheBox}
        onChange={whenLettersChange}
        placeholder="Search products"
        aria-describedby={showTypeAtLeastThreeHint ? "search-hint" : undefined}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-400"
      />
      {showTypeAtLeastThreeHint ? (
        <p id="search-hint" className="mt-2 text-sm text-zinc-400">
          Type at least 3 characters. Enter searches a shorter word.
        </p>
      ) : null}
    </div>
  );
}
