"use client";

import AuthModal from "@/components/modal/AuthModal";
import UploadModal from "@/components/modal/UploadModal";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
    </>
  );
};

export default ModalProvider;
