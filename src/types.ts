import type { AppRouter } from "./server/api/root";
import type { inferRouterOutputs } from "@trpc/server";

import type { Dispatch, SetStateAction } from "react";

import type { User } from "next-auth";

type RouterOutput = inferRouterOutputs<AppRouter>;

type GetIsoReportWithPostsFromDbOutput =
  RouterOutput["reports"]["getIsoReportWithPostsFromDb"];
export type IsoReportWithPostsFromDb =
  GetIsoReportWithPostsFromDbOutput;
export interface IsoReportCardProps {
  report: IsoReportWithPostsFromDb;
  setSearchString?: Dispatch<SetStateAction<string>>;
}

type getPostsByReportIdOutput =
  RouterOutput["posts"]["getPostsByReportId"];
export type Posts = getPostsByReportIdOutput;
export type Post = getPostsByReportIdOutput[number];

type getCommentsByPostIdOutput =
  RouterOutput["comments"]["getCommentsByPostId"];
export type Comments = getCommentsByPostIdOutput;
export type Comment = getCommentsByPostIdOutput[number];

type getAllNotificationsOutput =
  RouterOutput["notifications"]["getNotificationsByUserId"];
export type Notifications = getAllNotificationsOutput;
export type Notification = getAllNotificationsOutput[number];

type getAllStrainsOutput = RouterOutput["strains"]["getAllStrains"];
export type Strains = getAllStrainsOutput;
export type Strain = getAllStrainsOutput[number];

type getLikesByItemIdOutput = RouterOutput["like"]["getLikesByItemId"];
export type Likes = getLikesByItemIdOutput;
export type Like = getLikesByItemIdOutput[number];

export interface EditReportFormProps {
  user: User;
  report: IsoReportWithPostsFromDb;
  strains: Strains | undefined;
}

export interface ImageUploadResponse {
  success: boolean;
  imageId: string;
  imagePublicId: string;
  cloudUrl: string;
}
export interface CloudinarySignature {
  cloud_name: string;
  api_key: string;
  signature: string;
  timestamp: string;
  transformation: string;
  folder: string;
}

export interface CloudinaryResonse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: never[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

export interface MultiUploadResponse {
  success: boolean;
  imageIds: string[];
  imagePublicIds: string[];
  cloudUrls: string[];
}

export interface SortingPanelProps {
  desc: boolean;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  handleToggleDesc: () => void;
}

export interface FakeCardBadgeProps {
  country: string;
  badges: {
    emoji: string;
    label: string;
  }[];
}

export interface SplitObject {
  strain: string;
  searchstring: string;
}

export type NotificationEventMap =
  | "REPORT_CREATED" //TODO: NOTIFY user.followers
  | "POST_CREATED" //TODO: NOTIFY report.followers
  | "LIKE_CREATED"
  | "COMMENT_CREATED"
  | "COMMENT_ANSWERED";

export enum Locale {
  EN = "en",
  DE = "de",
}

export enum GrowStage {
  PREPARATION_STAGE = "Preparation",
  GERMINANTION_STAGE = "Germination",
  SEEDLING_STAGE = "Seedling",
  VEGETATIVE_STAGE = "Vegetative ",
  FLOWERING_STAGE = "Flowering",
  HARVEST_STAGE = "Harvest",
  CURING_STAGE = "Curing",
}

export enum Environment {
  INDOOR = "Indoor 💡",
  OUTDOOR = "Outdoor 🌦️",
}

export interface LightswattsDataPoint {
  date: Date;
  watt: number;
}
