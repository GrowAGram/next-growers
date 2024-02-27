import type { NotificationProps } from "@mantine/core";
import {
  IconCalendarOff,
  IconCannabis,
  IconError404,
  IconLogin,
} from "@tabler/icons-react";

export const noPostAtThisDay: NotificationProps & {
  message: string;
} = {
  title: "Error",
  message: "Sorry... no update for this day! 😢",
  color: "red",
  icon: <IconCalendarOff />,
  loading: false,
};
export const likeSuccessfulMsg: NotificationProps & {
  message: string;
} = {
  title: "Success",
  message: "Woohoo... you ❤️ this Grow!",
  color: "green",
  icon: <IconCannabis />,
  loading: false,
};
export const commentSuccessfulMsg: NotificationProps & {
  message: string;
} = {
  title: "Success",
  message: "Woohoo... you commented this Grow! 🥳",
  color: "green",
  icon: <IconCannabis />,
  loading: false,
};
export const dislikeSuccessfulMsg: NotificationProps & {
  message: string;
} = {
  title: "Success",
  message: "Oh no... you removed your like! 😢",
  color: "green",
  icon: <IconCannabis />,
  loading: false,
};
export const commentDeletedSuccessfulMsg: NotificationProps & {
  message: string;
} = {
  title: "Success",
  message: "Oh no... you removed your comment! 😢",
  color: "green",
  icon: <IconCannabis />,
  loading: false,
};

export const likeErrorMsg = (msg: string) => ({
  loading: false,
  title: "Error",
  message: msg,
  color: "red",
  icon: <IconLogin />,
});
export const createLikeErrorMsg = (msg: string) => ({
  loading: false,
  title: "Error",
  message: msg,
  color: "red",
  icon: <IconError404 />,
});
