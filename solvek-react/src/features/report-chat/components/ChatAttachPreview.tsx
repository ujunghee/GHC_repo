import { motion } from "framer-motion";

import { tapScale } from "../../report-search/motionConfig";

type ChatAttachPreviewProps = {
  url: string;
  name: string;
  onRemove: () => void;
};

export function ChatAttachPreview({ url, name, onRemove }: ChatAttachPreviewProps) {
  return (
    <div className="chat-attach-preview">
      <img className="chat-attach-preview__image" src={url} alt={name} draggable={false} />
      <motion.button
        className="chat-attach-preview__remove"
        type="button"
        aria-label="첨부 이미지 제거"
        onClick={onRemove}
        onPointerDown={(event) => event.stopPropagation()}
        {...tapScale}
      >
        <i className="chips-close-icon" aria-hidden="true"></i>
      </motion.button>
    </div>
  );
}
