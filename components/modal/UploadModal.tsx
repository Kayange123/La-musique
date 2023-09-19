import useUploadModal from "@/hooks/useUploadModal";
import { useState } from "react";
import Modal from "./Modal";
import uniqid from "uniqid";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import Input from "../ui/Input";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { user } = useUser();

  const onChange = (open: boolean) => {
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
      const uniqueID = uniqid();

      const { error: songError, data: songData } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${data.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });
      const { error: imageError, data: imageData } =
        await supabaseClient.storage
          .from("images")
          .upload(`image-${data.title}-${uniqueID}`, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });
      if (songError || imageError) {
        setIsLoading(false);
        return toast.error("failed to upload image and song");
      }

      const { error: insertError } = await supabaseClient.from("songs").insert({
        user_id: user.id,
        title: data.title,
        author: data.author,
        image_path: imageData.path,
        song_path: songData.path,
      });
      if (insertError) {
        setIsLoading(false);
        return toast.error(insertError.message);
      }

      router.refresh();
      toast.success("song created successfully");
      uploadModal.onClose();
    } catch (error) {
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
            accept="image/*"
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
