"use client";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { ISubscription, IUserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import { createContext, useState, useEffect, useContext } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: IUserDetails | null;
  isLoading: boolean;
  subscription: ISubscription | null;
};

export const userContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propname: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscriptionDetails = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);
      Promise.allSettled([getUserDetails(), getSubscriptionDetails()]).then(
        (results) => {
          const userDetailPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailPromise.status === "fulfilled") {
            setUserDetails(userDetailPromise.value.data as IUserDetails);
          }
          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(subscriptionPromise.value.data as ISubscription);
          }
          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);
  const value = {
    accessToken,
    user,
    userDetails,
    subscription,
    isLoading: isLoadingData || isLoadingUser,
  };

  return <userContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("useUser must be used in MyUserContextProvider");
  }
  return context;
};
