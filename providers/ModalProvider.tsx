"use client";

import AuthModal from "@/components/modal/AuthModal";
import UploadModal from "@/components/modal/UploadModal";
import EditSongModal from "@/components/modal/EditSongModal";
import DeleteSongModal from "@/components/modal/DeleteSongModal";
import CreatePlaylistModal from "@/components/modal/CreatePlaylistModal";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
      <EditSongModal />
      <DeleteSongModal />
      <CreatePlaylistModal />
    </>
  );
};

export default ModalProvider;
