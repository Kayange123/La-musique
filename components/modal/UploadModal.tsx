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
  AUDIO_ACCEPT,
  AUDIO_FORMATS,
  IMAGE_TYPES,
  getAudioExtension,
  isValidImage,
  isValidSong,
  toSafeFileName,
} from "@/lib/upload";

const fieldLabel = "flex flex-col gap-y-1.5 text-sm font-semibold text-fg";
// Native file pickers, styled to match: a pill button and the file name.
const fileInput =
  "h-auto py-2 file:mr-3 file:rounded-full file:bg-raised file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-fg";

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
      const extension = getAudioExtension(songFile);
      if (!extension || !isValidSong(songFile)) {
        return toast.error(
          "Song must be MP3, M4A, AAC, WAV, OGG or FLAC, under 50MB",
        );
      }
      if (!isValidImage(imageFile)) {
        return toast.error("Image must be a JPEG, PNG, WebP or GIF under 5MB");
      }

      const uniqueID = uniqid();
      const safeTitle = toSafeFileName(data.title);

      const [songUpload, imageUpload] = await Promise.all([
        supabaseClient.storage
          .from("songs")
          // The extension tells the player the format later.
          .upload(`song-${safeTitle}-${uniqueID}.${extension}`, songFile, {
            cacheControl: "3600",
            contentType: AUDIO_FORMATS.get(extension),
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
      title="Upload a song"
      description="Share a song with everyone on La-musique."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <label className={fieldLabel}>
          Title
          <Input
            disabled={isLoading}
            {...register("title", { required: true })}
          />
        </label>
        <label className={fieldLabel}>
          Artist
          <Input
            disabled={isLoading}
            {...register("author", { required: true })}
          />
        </label>
        <label className={fieldLabel}>
          Song
          <Input
            type="file"
            accept={AUDIO_ACCEPT}
            disabled={isLoading}
            className={fileInput}
            {...register("song", { required: true })}
          />
          <span className="text-xs font-normal text-muted">
            MP3, M4A, AAC, WAV, OGG or FLAC, up to 50MB.
          </span>
        </label>
        <label className={fieldLabel}>
          Cover image
          <Input
            type="file"
            accept={IMAGE_TYPES.join(",")}
            disabled={isLoading}
            className={fileInput}
            {...register("image", { required: true })}
          />
          <span className="text-xs font-normal text-muted">
            JPEG, PNG, WebP or GIF, up to 5MB.
          </span>
        </label>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
