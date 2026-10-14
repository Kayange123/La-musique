import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { roundIconButton } from "../ui/styles";

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
        <Dialog.Overlay className="bg-canvas/80 backdrop-blur-sm fixed inset-0 z-40" />
        <Dialog.Content className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] h-full max-h-full w-full overflow-y-auto border border-line bg-surface p-6 shadow-2xl md:h-auto md:max-h-[85vh] md:w-[90vw] md:max-w-[480px] md:rounded-2xl">
          <Dialog.Title className="font-display text-2xl font-bold tracking-tight text-fg pr-10">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 mb-5 text-muted">
            {description}
          </Dialog.Description>
          <div>{children}</div>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className={`${roundIconButton} absolute top-5 right-5`}
            >
              <IoMdClose size={18} aria-hidden="true" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
