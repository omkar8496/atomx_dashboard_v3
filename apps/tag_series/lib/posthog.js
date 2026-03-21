import { PostHog } from "posthog-node";

let _client;

export function getPostHogClient() {
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      enableExceptionAutocapture: true
    });
  }
  return _client;
}
