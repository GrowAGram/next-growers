import {
  ActionIcon,
  Box,
  Modal,
  useMantineColorScheme,
} from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import type { Editor } from "@tiptap/react";
import type { EmojiClickData } from "emoji-picker-react";
import { EmojiStyle, SkinTones, Theme } from "emoji-picker-react";

import dynamic from "next/dynamic";

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

interface EmojiPickerProps {
  editor: Editor;
}

function EmojiPicker({ editor }: EmojiPickerProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const clickOutsidePicker = useClickOutside(() => close());

  function handleEmojiClick(emojiData: EmojiClickData) {
    editor?.commands.insertContent(emojiData.emoji);
  }

  return (
    <>
      <ActionIcon variant="default" size={26} onClick={open}>
        😍
      </ActionIcon>

      <Modal
        size={350}
        closeOnClickOutside={true}
        transitionProps={{ transition: "fade", duration: 100 }}
        withCloseButton={false}
        withOverlay={true}
        opened={opened}
        onClose={close}
        // className="absolute z-50"
      >
        <Box ref={clickOutsidePicker}>
          <Picker
            open={opened}
            emojiStyle={EmojiStyle.NATIVE}
            defaultSkinTone={SkinTones.MEDIUM}
            theme={dark ? Theme.DARK : Theme.LIGHT}
            height={360}
            width={"100%"}
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            reactionsDefaultOpen={false}
            allowExpandReactions={true}
            previewConfig={{ showPreview: false }}
          />
        </Box>
      </Modal>
    </>
  );
}

export default EmojiPicker;
