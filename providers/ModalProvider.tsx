"use client";

import AuthModal from "@/components/modal/AuthModal";
import UploadModal from "@/components/modal/UploadModal";
import EditSongModal from "@/components/modal/EditSongModal";
import DeleteSongModal from "@/components/modal/DeleteSongModal";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
      <EditSongModal />
      <DeleteSongModal />
    </>
  );
};

export default ModalProvider;
