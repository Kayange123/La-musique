"use client";

import { Database } from "@/types_db";
import { createClient } from "@/lib/supabase/client";
import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

type SupabaseContextType = {
  supabaseClient: SupabaseClient<Database>;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [supabaseClient] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The first event is INITIAL_SESSION, so this also sets the starting state.
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  return (
    <SupabaseContext.Provider
      value={{
        supabaseClient,
        session,
        user: session?.user ?? null,
        isLoading,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used in SupabaseProvider");
  }
  return context;
};

export default SupabaseProvider;
