"use client";

import Container from "@/components/ui/Container";
import { IoMdRefresh } from "react-icons/io";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <Container className="h-full flex flex-col gap-y-4 items-center justify-center">
      {error && (
        <p className="text-slate-700 dark:text-white text-base font-medium">
          {error.message || "Something went wrong. Please try again."}
        </p>
      )}
      <button
        onClick={reset}
        className="flex gap-x-2 px-3 py-1 bg-white text text-slate-600 font-medium text-lg rounded-lg"
      >
        Refresh
        <IoMdRefresh size={26} />
      </button>
    </Container>
  );
};

export default Error;
