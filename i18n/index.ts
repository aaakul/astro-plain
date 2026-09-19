import { createAstroI18n } from "ts-intl-astro";
import SiteConfig from "~/site.config";
import { z } from "astro/zod";

import enUS from "./messages/en-US";
import jaJP from "./messages/ja-JP";
import zhHans from "./messages/zh-Hans";

// Validate language settings from site.config.ts
const langCodeSchema = z.string().regex(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/);

const langConfigSchema = z
  .object({
    languageNameMap: z.record(langCodeSchema, z.string().min(2)),
    defaultLanguage: langCodeSchema,
  })
  .superRefine((data, ctx) => {
    // Ensure defaultLanguage exists in languageNameMap
    if (!(data.defaultLanguage in data.languageNameMap)) {
      ctx.addIssue({
        code: "custom",
        message: "defaultLanguage must be in languageNameMap",
      });
    }
  });

try {
  langConfigSchema.parse(SiteConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
    let message: string = "Wrong language configuration in site.config.ts. ";

    const customIssue = error.issues.filter((e) => e.code === "custom");
    const formatIssue = error.issues.filter((e) => e.code !== "custom");

    formatIssue.forEach(
      (e) => (message += `Invalid language code or map name: \`${e.path.join(".")}\`. `),
    );

    if (formatIssue.length === 0) {
      customIssue.forEach((e) => (message += e.message + ". "));
    }

    throw new Error(message);
  }
}

export const {
  useTranslations,
  useLocale,
  useFormatter,
  getTranslations,
  getFormatter,
  isSupportedLanguage,
  languages,
  defaultLanguage,
} = createAstroI18n({
  defaultLanguage: "zh-Hans",
  messages: {
    "zh-Hans": zhHans,
    "en-US": enUS,
    "ja-JP": jaJP,
  },
});

/** Supported language codes as union type */
export type Language = (typeof languages)[number];
export type Lang = Language;

/** Map of language code to display name (e.g. { "en-US": "English", ... }) */
export const LANG_NAME_MAP = SiteConfig.languageNameMap;

/** Array of all supported language codes */
export const AVAILABLE_LANG = languages as readonly [Lang, ...Lang[]];

/** Default fallback language */
export const DEFAULT_LANG = defaultLanguage;
