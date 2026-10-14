"use client";

import { FiX } from "react-icons/fi";
import Modal from "../modal/Modal";
import QueueList from "./QueueList";
import useQueuePanel from "@/hooks/useQueuePanel";
import useMediaQuery from "@/hooks/useMediaQuery";
import { roundIconButton, sectionTitle } from "../ui/styles";
import usePlayer from "@/hooks/usePlayer";

// Desktop: a column beside the page, so the player stays usable while it's
// open. Phones: a dialog over the page.
const QueuePanel = () => {
  const { isOpen, close } = useQueuePanel();
  const hasSong = usePlayer((state) => state.activeId !== undefined);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen || !hasSong) {
    return null;
  }

  if (!isDesktop) {
    return (
      <Modal
        isopen
        onChange={(open) => !open && close()}
        title="Up next"
        description="Songs you queue play before the rest of the list."
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <QueueList />
        </div>
      </Modal>
    );
  }

  return (
    <aside
      aria-labelledby="queue-panel-heading"
      className="w-[340px] shrink-0 h-full overflow-y-auto bg-surface rounded-xl p-4 my-2 mr-2 flex flex-col gap-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 id="queue-panel-heading" className={sectionTitle}>
          Up next
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close queue"
          className={roundIconButton}
        >
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>
      <QueueList />
    </aside>
  );
};

export default QueuePanel;
