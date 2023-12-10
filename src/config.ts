import { createContext } from "react";
import { z } from "zod";

interface Config {
  api: {
    baseUrl: string;
  };
  enabledFeatures: Array<"infinite-scroll" | "dark-mode" | "share-button">;
  datadog?: {
    applicationId: string;
    site: string;
  };
  sentry?: {
    dsn: string;
  };
}

export const parseConfig = (
  envVars: Record<string, string | undefined>,
): Config => {
  // Define the env schema
  // ----------------------------------------------------------------------

  const apiEnvSchema = z.object({
    REACT_APP_API_BASE_URL: z.string().url(),
  });

  const dataDogEnvSchema = z
    .object({
      REACT_APP_DATADOG_APPLICATION_ID: z.string(),
      REACT_APP_DATADOG_SITE: z.string(),
    })
    .or(
      z.object({
        REACT_APP_DATADOG_APPLICATION_ID: z.undefined(),
        REACT_APP_DATADOG_SITE: z.undefined(),
      }),
    );

  const sentryEnvSchema = z
    .object({
      REACT_APP_SENTRY_AUTH_TOKEN: z.string(),
      REACT_APP_SENTRY_DSN: z.string().url(),
    })
    .or(
      z.object({
        REACT_APP_SENTRY_AUTH_TOKEN: z.undefined(),
        REACT_APP_SENTRY_DSN: z.undefined(),
      }),
    );

  const enabledFeaturesSchema = z.object({
    REACT_APP_ENABLED_FEATURES: z.string().optional(),
  });

  const fullEnvSchema = apiEnvSchema
    .and(sentryEnvSchema)
    .and(dataDogEnvSchema)
    .and(enabledFeaturesSchema);

  // Validate env
  // ----------------------------------------------------------------------

  const env = fullEnvSchema.parse(envVars);

  // Assemble the config object
  // ----------------------------------------------------------------------

  const api = { baseUrl: env.REACT_APP_API_BASE_URL };

  const enabledFeatures = env.REACT_APP_ENABLED_FEATURES
    ? z
        .array(z.enum(["infinite-scroll", "dark-mode", "share-button"]))
        .parse(env.REACT_APP_ENABLED_FEATURES.split(","))
    : [];

  const datadog = env.REACT_APP_DATADOG_APPLICATION_ID
    ? {
        site: env.REACT_APP_DATADOG_SITE,
        applicationId: env.REACT_APP_DATADOG_APPLICATION_ID,
      }
    : undefined;

  const sentry = env.REACT_APP_SENTRY_DSN
    ? {
        dsn: env.REACT_APP_SENTRY_DSN,
      }
    : undefined;

  return {
    api,
    enabledFeatures,
    datadog,
    sentry,
  };
};

export const ConfigContext = createContext<Config | null>(null);
