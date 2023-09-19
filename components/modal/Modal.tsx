import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isopen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}
const Modal = ({
  isopen,
  title,
  description,
  onChange,
  children,
}: ModalProps) => {
  return (
    <Dialog.Root open={isopen} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-900/90 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed drop-shadow-md border border-neutral-700 top-[50%] left-[50%] max-h-full h-full md:h-auto md:max-h-[85vh] w-full md:w-[90vw] md:max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-neutral-800 p-[25px] focus:outline-none">
          <Dialog.Title className="text-xl text-center font-bold mb-2">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-3 text-sm md:text-lg leading-normal text-center">
            {description}
          </Dialog.Description>
          <div className="">{children}</div>
          <Dialog.Close asChild>
            <button className="text-neutral-400 hover:text-white absolute top-3 right-3">
              <IoMdClose size={25} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
