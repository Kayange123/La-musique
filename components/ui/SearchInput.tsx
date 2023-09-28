"use client";

import qs from "query-string";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import Input from "./Input";

const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState<string>("");
  const debouncedValue = useDebounce<string>(value, 1000);
  useEffect(() => {
    const query = {
      title: debouncedValue,
    };
    const url = qs.stringifyUrl(
      {
        url: "/search",
        query,
      },
      { skipNull: true }
    );
    router.push(url);
  }, [debouncedValue, router]);
  return (
    <Input
      placeholder="what do you want to listen today?"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default SearchInput;
