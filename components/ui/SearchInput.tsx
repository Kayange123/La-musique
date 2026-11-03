"use client";

import qs from "query-string";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import { BiSearch } from "react-icons/bi";
import { pageTitle } from "./styles";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Start from the URL, so a shared or reloaded search keeps its text.
  const current = searchParams.get("title") ?? "";
  const [value, setValue] = useState<string>(current);
  const debouncedValue = useDebounce<string>(value, 1000);
  useEffect(() => {
    // Already showing these results.
    if (debouncedValue === current) {
      return;
    }
    const query = {
      title: debouncedValue,
    };
    const url = qs.stringifyUrl(
      {
        url: "/search",
        query,
      },
      { skipNull: true },
    );
    router.push(url);
  }, [debouncedValue, current, router]);
  return (
    <div className="flex flex-col gap-y-4 max-w-xl">
      <label htmlFor="search-input" className={pageTitle}>
        Search
      </label>
      {/* The input hides its own outline; the pill shows the focus ring. */}
      <div className="flex h-12 items-center gap-x-3 rounded-full bg-fg px-4 text-on-accent focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <BiSearch size={20} aria-hidden="true" />
        <input
          id="search-input"
          type="search"
          placeholder="Songs or artists"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-full flex-1 bg-transparent text-base text-on-accent placeholder:text-on-light-muted focus:outline-none"
        />
      </div>
    </div>
  );
};

export default SearchInput;
