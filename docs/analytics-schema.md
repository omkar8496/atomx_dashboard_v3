# AtomX Analytics Schema (PostHog)

This schema keeps event names and properties consistent across apps.

## Shared property conventions

- `app` (required): `access_portal` | `dashboard` | `tag_series`
- `user_email` (optional): user email from token/profile
- `service` (optional): normalized service name (`admin`, `tag-series`, `cashless`, `inventory`, ...)
- `event_id` (optional): numeric/string event id
- `admin_id` (optional): numeric/string admin id
- `status` (optional): `success` | `failure` when useful
- `error_message` (optional): failure reason

## Auth events

- `login_start`
  - Required: `app`
  - Optional: `provider`, `redirect_path`
- `login_success`
  - Required: `app`
  - Optional: `user_email`, `role_type`, `has_roles`
- `login_failure`
  - Required: `app`
  - Optional: `stage`, `error_message`

## Module selection events

- `module_role_selected`
  - Required: `app`
  - Optional: `user_email`, `module_type`, `selected_label`, `event_id`, `admin_id`
- `module_selected`
  - Required: `app`
  - Optional: `user_email`, `module_type`, `service`, `event_id`, `admin_id`, `destination`
- `module_selection_failed`
  - Required: `app`
  - Optional: `user_email`, `module_type`, `service`, `event_id`, `admin_id`, `error_message`

## Session events

- `session_identified`
  - Required: `app`
  - Optional: `user_email`, `role_type`
- `session_relogin_start`
  - Required: `app`
  - Optional: `service`, `event_id`, `admin_id`, `return_to`
- `session_relogin_success`
  - Required: `app`
  - Optional: `service`, `source`

## Tag Series operation events

- `operation_event_setup_submitted`
- `operation_tag_batch_generated`
- `operation_tag_excel_downloaded`
- `$exception` (reserved for errors)

All operation events should include at least `app: "tag_series"` and contextual ids where available.
