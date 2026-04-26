# Smart Stethoscope — PocketBase Collections

## `users` (Auth)
- `name` — text
- `avatar` — file (single)
- `isDoctor` — bool
- Unique indexes: `tokenKey`, `email`
- Plus default auth fields: `id`, `password`, `tokenKey`, `email`, `emailVisibility`, `verified`, `created`, `updated`

## `respirai_audio` (Base)
- `device_id` — text
- `volume` — number
- `db` — number
- `audio_file` — file (single)
- `created`, `updated` — autodate

## `respirai_results` (Base)
- `status` — select single: `queued`, `processing`, `complete`
- `num_frames` — number
- `pred_class` — number
- `audio_id` — relation → respirai_audio (single)
- `pred_name` — text
- `pred_method` — select single: `mean_prob`, `majority_vote`
- `prob_normal` — number
- `prob_crackles` — number
- `prob_wheezes` — number
- `prob_both` — number
- `frame_predictions` — json
- `created`, `updated` — autodate

## `devices` (Base)
- `device_code` — text, required, unique (QR payload)
- `name` — text
- `model` — text
- `firmware_version` — text
- `owner` — relation → users (single)
- `status` — select single: `active`, `inactive`, `unpaired`
- `last_seen` — date
- `created`, `updated` — autodate
- Unique index: `device_code`

## `doctors` (Base)
- `user` — relation → users (single), required, unique
- `full_name` — text, required
- `specialist` — text (e.g. "Cardiology", "Pulmonology")
- `created`, `updated` — autodate

## `patients` (Base)
- `doctor` — relation → doctors (single), required
- `user` — relation → users (single), nullable, unique (the patient's own login account, if they have one)
- `full_name` — text, required
- `gender` — select single: `male`, `female`, `other`
- `date_of_birth` — date
- `avatar` — file (single)
- `medical_history` — editor
- `status` — select single: `review`, `follow_up`, `normal`
- `created`, `updated` — autodate

## `recordings` (Base)
- `patient` — relation → patients (single), required
- `doctor` — relation → doctors (single), required
- `audio` — relation → respirai_audio (single, cascade delete)
- `result` — relation → respirai_results (single, nullable)
- `location` — select single: `at_hospital`, `at_home`, `clinic_visit`
- `body_position` — select single: `mitral`, `aortic`, `pulmonic`, `tricuspid`
- `diagnosis_title` — text
- `severity` — select single: `normal`, `low`, `medium`, `high`
- `confidence` — number (0–100)
- `confirmed` — bool
- `doctor_note` — editor
- `created`, `updated` — autodate
- Note: `respirai_audio` and `respirai_results` do not hold back-references; always traverse from `recordings`.

## `consultations` (Base)
- `patient` — relation → patients (single)
- `doctor` — relation → doctors (single)
- `title` — text
- `scheduled_at` — date, required
- `type` — select single: `video_call`, `voice_call`, `in_person`, `follow_up`
- `status` — select single: `pending`, `scheduled`, `completed`, `cancelled`
- `notes` — editor
- `created`, `updated` — autodate

## `conversations` (Base)
- `participants` — relation → users (multiple), required
- `last_message_at` — date
- `last_message_preview` — text
- `created`, `updated` — autodate

## `messages` (Base)
- `conversation` — relation → conversations (single, cascade delete)
- `sender` — relation → users (single)
- `body` — text, required
- `attachments` — file (multiple, optional)
- `read_by` — relation → users (multiple)
- `created` — autodate

## `notifications` (Base)
- `user` — relation → users (single), required
- `type` — select single: `recording_ready`, `message`, `consultation`, `system`
- `title` — text, required
- `body` — text
- `link` — text
- `read` — bool, default false
- `created` — autodate
