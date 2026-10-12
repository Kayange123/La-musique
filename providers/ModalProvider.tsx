"use client";

import AuthModal from "@/components/modal/AuthModal";
import UploadModal from "@/components/modal/UploadModal";
import EditSongModal from "@/components/modal/EditSongModal";
import DeleteSongModal from "@/components/modal/DeleteSongModal";
import CreatePlaylistModal from "@/components/modal/CreatePlaylistModal";
import RenamePlaylistModal from "@/components/modal/RenamePlaylistModal";
import DeletePlaylistModal from "@/components/modal/DeletePlaylistModal";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
      <EditSongModal />
      <DeleteSongModal />
      <CreatePlaylistModal />
      <RenamePlaylistModal />
      <DeletePlaylistModal />
      <AddToPlaylistModal />
    </>
  );
};

export default ModalProvider;
