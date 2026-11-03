"use client";

import AuthModal from "@/components/modal/AuthModal";
import UploadModal from "@/components/modal/UploadModal";
import EditSongModal from "@/components/modal/EditSongModal";
import DeleteSongModal from "@/components/modal/DeleteSongModal";
import ReportSongModal from "@/components/modal/ReportSongModal";
import CreatePlaylistModal from "@/components/modal/CreatePlaylistModal";
import EditPlaylistModal from "@/components/modal/EditPlaylistModal";
import DeletePlaylistModal from "@/components/modal/DeletePlaylistModal";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
      <EditSongModal />
      <DeleteSongModal />
      <ReportSongModal />
      <CreatePlaylistModal />
      <EditPlaylistModal />
      <DeletePlaylistModal />
      <AddToPlaylistModal />
    </>
  );
};

export default ModalProvider;
