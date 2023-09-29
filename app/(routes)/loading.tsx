"use client";

import Container from "@/components/ui/Container";
import { BarLoader } from "react-spinners";

const Loading = () => {
  return (
    <Container className="h-full items-center justify-center flex">
      <BarLoader color="#22c55e" />
    </Container>
  );
};

export default Loading;
