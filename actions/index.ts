import { ISong } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getSongs = async (): Promise<ISong[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data as any) || [];
};

export const getSongsByUserId = async () => {
  const supabase = createServerComponentClient({
    cookies,
  });

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.log(sessionError?.message);
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", sessionData?.session?.user?.id);

  if (error) {
    console.log(error);
  }

  return (data as any) || [];
};
