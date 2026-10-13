import { Tables } from "@/types_db";

export type ISong = Tables<"songs">;
export type IUserDetails = Tables<"users">;
export type IProduct = Tables<"products">;
export type IPrice = Tables<"prices"> & { products?: IProduct | null };
export type ISubscription = Tables<"subscriptions"> & {
  prices?: IPrice | null;
};
export type IPlaylist = Tables<"playlists">;
