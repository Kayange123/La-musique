import useUploadModal from "@/hooks/useUploadModal";
import { useState } from "react";
import Modal from "./Modal";
import uniqid from "uniqid";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import Input from "../ui/Input";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabase } from "@/providers/Supabase";
import { useRouter } from "next/navigation";
import {
  IMAGE_TYPES,
  isValidImage,
  isValidSong,
  toSafeFileName,
} from "@/lib/upload";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const { user } = useUser();

  const onChange = () => {
    reset();
    uploadModal.onClose();
  };
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      const imageFile = data.image?.[0];
      const songFile = data.song?.[0];

      if (!imageFile || !songFile || !user) {
        return toast.error("Missing fields");
      }
      if (!isValidSong(songFile)) {
        return toast.error("Song must be an mp3 file under 20MB");
      }
      if (!isValidImage(imageFile)) {
        return toast.error("Image must be a JPEG, PNG, WebP or GIF under 5MB");
      }

      const uniqueID = uniqid();
      const safeTitle = toSafeFileName(data.title);

      const [songUpload, imageUpload] = await Promise.all([
        supabaseClient.storage
          .from("songs")
          .upload(`song-${safeTitle}-${uniqueID}`, songFile, {
            cacheControl: "3600",
            contentType: "audio/mpeg",
            upsert: false,
          }),
        supabaseClient.storage
          .from("images")
          .upload(`image-${safeTitle}-${uniqueID}`, imageFile, {
            cacheControl: "3600",
            contentType: imageFile.type,
            upsert: false,
          }),
      ]);

      const removeUploads = () =>
        Promise.all([
          songUpload.data &&
            supabaseClient.storage.from("songs").remove([songUpload.data.path]),
          imageUpload.data &&
            supabaseClient.storage
              .from("images")
              .remove([imageUpload.data.path]),
        ]);

      if (songUpload.error || imageUpload.error) {
        await removeUploads();
        return toast.error("failed to upload image and song");
      }

      const { error: insertError } = await supabaseClient.from("songs").insert({
        user_id: user.id,
        title: data.title,
        author: data.author,
        image_path: imageUpload.data.path,
        song_path: songUpload.data.path,
      });
      if (insertError) {
        await removeUploads();
        return toast.error(insertError.message);
      }

      router.refresh();
      toast.success("song created successfully");
      reset();
      uploadModal.onClose();
    } catch {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });
  return (
    <Modal
      isopen={uploadModal.isOpen}
      onChange={onChange}
      title="Add a new song"
      description="Upload an mp3 file..."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register("title", { required: true })}
          placeholder="song title"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register("author", { required: true })}
          placeholder="Name of the author"
        />
        <div>
          <p className="pb-1">select a song</p>
          <Input
            id="song"
            type="file"
            accept=".mp3"
            disabled={isLoading}
            {...register("song", { required: true })}
          />
        </div>
        <div>
          <p className="pb-1">select an image</p>
          <Input
            id="image"
            type="file"
            accept={IMAGE_TYPES.join(",")}
            disabled={isLoading}
            {...register("image", { required: true })}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "creating..." : "create"}
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
