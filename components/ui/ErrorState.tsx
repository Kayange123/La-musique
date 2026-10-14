"use client";

import { IoMdRefresh } from "react-icons/io";
import Container from "./Container";
import { pillAccent } from "./styles";

// Shown by every route's error.tsx when a page fails to render.
const ErrorState = ({ error, reset }: { error: Error; reset: () => void }) => (
  <Container className="h-full flex flex-col gap-y-4 items-center justify-center p-6 text-center">
    <p className="font-display text-2xl font-bold text-fg">
      Something went wrong
    </p>
    <p className="max-w-md text-muted">
      {error?.message || "Please try again."}
    </p>
    <button type="button" onClick={reset} className={pillAccent}>
      <IoMdRefresh size={18} aria-hidden="true" />
      Try again
    </button>
  </Container>
);

export default ErrorState;
