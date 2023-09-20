import { ISong } from "@/types";
import useAuthModal from "./useAuthModal";
import { useUser } from "./useUser";
import usePlayer from "./usePlayer";

const useOnPlay = (songs: ISong[]) => {
  const authModal = useAuthModal();
  const { user } = useUser();
  const player = usePlayer();

  const onPlay = (id: string) => {
    if (!user) {
      return authModal.onOpen();
    }
    player.setId(id);
    player.setIds(songs.map((song) => song?.id));
  };

  return onPlay;
};

export default useOnPlay;
