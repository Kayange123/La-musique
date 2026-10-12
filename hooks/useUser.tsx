"use client";
import { ISubscription, IUserDetails } from "@/types";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/providers/Supabase";
import { createContext, useState, useEffect, useContext } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: IUserDetails | null;
  isLoading: boolean;
  subscription: ISubscription | null;
};

export const userContext = createContext<UserContextType | undefined>(
  undefined,
);

interface UserData {
  userId: string;
  userDetails: IUserDetails | null;
  subscription: ISubscription | null;
}

export const MyUserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<UserData | null>(null);
  const {
    session,
    user,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSupabase();
  const accessToken = session?.access_token ?? null;
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;

    Promise.allSettled([
      supabase.from("users").select("*").single(),
      supabase
        .from("subscriptions")
        .select("*, prices(*, products(*))")
        .in("status", ["trialing", "active"])
        .single(),
    ]).then(([userDetailsResult, subscriptionResult]) => {
      if (cancelled) {
        return;
      }
      setData({
        userId,
        userDetails:
          userDetailsResult.status === "fulfilled"
            ? userDetailsResult.value.data
            : null,
        subscription:
          subscriptionResult.status === "fulfilled"
            ? subscriptionResult.value.data
            : null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  const current = data && data.userId === userId ? data : null;
  const value = {
    accessToken,
    user,
    userDetails: current?.userDetails ?? null,
    subscription: current?.subscription ?? null,
    isLoading: isLoadingUser || (!!userId && !current),
  };

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("useUser must be used in MyUserContextProvider");
  }
  return context;
};
