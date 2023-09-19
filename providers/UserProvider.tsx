"use client";

import { MyUserContextProvider } from "@/hooks/useUser";
import React from "react";

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  return <MyUserContextProvider>{children}</MyUserContextProvider>;
};

export default UserProvider;
