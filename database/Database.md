| table_name       | column_name       | data_type                   | is_nullable |
| ---------------- | ----------------- | --------------------------- | ----------- |
| attachments      | id                | uuid                        | NO          |
| attachments      | email_id          | uuid                        | YES         |
| attachments      | file_name         | text                        | NO          |
| attachments      | file_type         | text                        | NO          |
| attachments      | file_size         | integer                     | NO          |
| attachments      | file_url          | text                        | NO          |
| attachments      | is_encrypted      | boolean                     | YES         |
| attachments      | created_at        | timestamp with time zone    | YES         |
| contacts         | id                | uuid                        | NO          |
| contacts         | user_id           | uuid                        | YES         |
| contacts         | contact_email     | text                        | NO          |
| contacts         | full_name         | text                        | YES         |
| contacts         | profile_image_url | text                        | YES         |
| contacts         | notes             | text                        | YES         |
| contacts         | is_favorite       | boolean                     | YES         |
| contacts         | created_at        | timestamp with time zone    | YES         |
| contacts         | updated_at        | timestamp with time zone    | YES         |
| email_labels     | email_id          | uuid                        | NO          |
| email_labels     | label_id          | uuid                        | NO          |
| email_labels     | created_at        | timestamp with time zone    | YES         |
| email_recipients | id                | uuid                        | NO          |
| email_recipients | email_id          | uuid                        | YES         |
| email_recipients | recipient_id      | uuid                        | YES         |
| email_recipients | recipient_type    | text                        | YES         |
| email_recipients | status            | text                        | YES         |
| email_recipients | starred           | boolean                     | YES         |
| email_recipients | created_at        | timestamp with time zone    | YES         |
| email_recipients | updated_at        | timestamp with time zone    | YES         |
| email_tracking   | id                | uuid                        | NO          |
| email_tracking   | email_id          | uuid                        | YES         |
| email_tracking   | recipient_id      | uuid                        | YES         |
| email_tracking   | first_opened_at   | timestamp with time zone    | YES         |
| email_tracking   | last_opened_at    | timestamp with time zone    | YES         |
| email_tracking   | open_count        | integer                     | YES         |
| email_tracking   | user_agent        | text                        | YES         |
| email_tracking   | ip_address        | text                        | YES         |
| email_tracking   | created_at        | timestamp with time zone    | YES         |
| email_tracking   | updated_at        | timestamp with time zone    | YES         |
| emails           | id                | uuid                        | NO          |
| emails           | sender_id         | uuid                        | YES         |
| emails           | subject           | text                        | NO          |
| emails           | content           | text                        | NO          |
| emails           | encrypted_key     | text                        | YES         |
| emails           | is_encrypted      | boolean                     | YES         |
| emails           | thread_id         | uuid                        | YES         |
| emails           | parent_email_id   | uuid                        | YES         |
| emails           | importance        | text                        | YES         |
| emails           | category          | text                        | YES         |
| emails           | read_receipt      | boolean                     | YES         |
| emails           | has_attachments   | boolean                     | YES         |
| emails           | is_draft          | boolean                     | YES         |
| emails           | is_scheduled      | boolean                     | YES         |
| emails           | scheduled_for     | timestamp with time zone    | YES         |
| emails           | created_at        | timestamp with time zone    | YES         |
| emails           | updated_at        | timestamp with time zone    | YES         |
| labels           | id                | uuid                        | NO          |
| labels           | user_id           | uuid                        | YES         |
| labels           | name              | text                        | NO          |
| labels           | color             | text                        | YES         |
| labels           | description       | text                        | YES         |
| labels           | created_at        | timestamp with time zone    | YES         |
| labels           | updated_at        | timestamp with time zone    | YES         |
| password_resets  | id                | uuid                        | NO          |
| password_resets  | user_id           | uuid                        | YES         |
| password_resets  | email             | text                        | NO          |
| password_resets  | code              | text                        | NO          |
| password_resets  | created_at        | timestamp with time zone    | YES         |
| password_resets  | expires_at        | timestamp with time zone    | NO          |
| password_resets  | used_at           | timestamp with time zone    | YES         |
| users            | id                | uuid                        | NO          |
| users            | email             | text                        | NO          |
| users            | full_name         | text                        | NO          |
| users            | display_name      | text                        | YES         |
| users            | profile_image_url | text                        | YES         |
| users            | is_verified       | boolean                     | YES         |
| users            | public_key        | text                        | YES         |
| users            | last_login_at     | timestamp without time zone | YES         |
| users            | last_active_at    | timestamp without time zone | YES         |
| users            | preferences       | jsonb                       | YES         |
| users            | created_at        | timestamp with time zone    | YES         |
| users            | updated_at        | timestamp with time zone    | YES         |