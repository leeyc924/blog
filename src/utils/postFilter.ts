import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

const postFilter = ({ data }: CollectionEntry<"blog">) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  /* v8 ignore start */
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
  /* v8 ignore stop */
};

export default postFilter;
