"use client";

import { BarLoader } from "react-spinners";
import Container from "./Container";
import { colors } from "@/lib/theme";

// Shown by every route's loading.tsx while its page loads.
const LoadingState = () => (
  <Container className="h-full flex items-center justify-center">
    <BarLoader color={colors.accent} aria-label="Loading" />
  </Container>
);

export default LoadingState;
