SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict h1Y82ylSGnaaTgoYvSrTbNkFr4tI2P7wSojTkGVyVXuEiE5efv0xAThqQaqHHLh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b', 'authenticated', 'authenticated', 'techatvision@gmail.com', '$2a$10$xbBOXOJo9RqFdnUv7Jofl.DrEo/5EsNvbKCM0tRrwZEGtIhoTyK1W', NULL, NULL, '7f8a567c26f002080bcb7f2832269fdfed2c6b25638b6cc86073942c', '2026-01-24 17:49:52.841665+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b", "email": "techatvision@gmail.com", "full_name": "Jhon Doe", "email_verified": false, "phone_verified": false}', NULL, '2026-01-24 17:49:52.830693+00', '2026-01-24 17:49:55.514834+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', 'authenticated', 'authenticated', 'jignesh.vision.17@gmail.com', '$2a$10$Zn6tLyT4LQVuSUZzTNx/vuju7hOmzHA8VH31j1zhYRL8Ooi4Gt3A.', '2025-12-29 09:54:35.744602+00', NULL, '', '2025-12-29 09:54:20.798379+00', '', NULL, '', '', NULL, '2026-02-06 20:28:20.442953+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "bb6fc3e9-21a2-45c3-b183-af1af0a0bd28", "email": "jignesh.vision.17@gmail.com", "full_name": "Jignesh Ameta", "email_verified": true, "phone_verified": false}', NULL, '2025-12-29 09:54:20.75337+00', '2026-02-06 20:28:20.450797+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', 'authenticated', 'authenticated', 'tanishamaratha12@gmail.com', '$2a$10$lW1E1R09FgG.iGYkIvZRZ.OHUEEBfuQYXwZCvdnBrdQpqBZSi0r4e', '2026-02-02 10:04:32.868003+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-02 10:05:05.357901+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-02-02 10:04:32.86255+00', '2026-02-02 11:03:32.90973+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '14814863-7a39-4852-b3cd-8f4395c476d8', 'authenticated', 'authenticated', 'admin@aonetop.com', '$2a$10$LssFq4QgQHsh8hhCeL.Dwu5LWKSOTOlkpo20cXstnA3NbBtoi/Ch2', '2026-01-01 17:01:49.771896+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-07 19:43:18.952345+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-01-01 17:01:49.753187+00', '2026-02-08 10:57:10.037673+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cac70c0f-a58b-46ab-bc26-f2c415409ce9', 'authenticated', 'authenticated', 'harshitamaratha035@gmail.com', '$2a$10$IAOjncduPp0CBfRjYg21YOfI8fLKxN93Jhk.BSVrkUgW6WWcimykK', '2026-01-09 16:14:46.063366+00', NULL, '', '2026-01-09 16:14:20.419308+00', '', NULL, '', '', NULL, '2026-02-06 19:55:56.672468+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "cac70c0f-a58b-46ab-bc26-f2c415409ce9", "email": "harshitamaratha035@gmail.com", "full_name": "Harshita Maratha ", "email_verified": true, "phone_verified": false}', NULL, '2026-01-09 16:14:20.335758+00', '2026-02-06 19:55:56.675258+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', 'bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', '{"sub": "bb6fc3e9-21a2-45c3-b183-af1af0a0bd28", "email": "jignesh.vision.17@gmail.com", "full_name": "Jignesh Ameta", "email_verified": true, "phone_verified": false}', 'email', '2025-12-29 09:54:20.786025+00', '2025-12-29 09:54:20.786079+00', '2025-12-29 09:54:20.786079+00', '2850bf21-deac-45bb-b6c8-989c0706183b'),
	('14814863-7a39-4852-b3cd-8f4395c476d8', '14814863-7a39-4852-b3cd-8f4395c476d8', '{"sub": "14814863-7a39-4852-b3cd-8f4395c476d8", "email": "admin@aonetop.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-01 17:01:49.764869+00', '2026-01-01 17:01:49.764928+00', '2026-01-01 17:01:49.764928+00', 'cd99630d-90e1-42f2-9535-e8d5511483cc'),
	('cac70c0f-a58b-46ab-bc26-f2c415409ce9', 'cac70c0f-a58b-46ab-bc26-f2c415409ce9', '{"sub": "cac70c0f-a58b-46ab-bc26-f2c415409ce9", "email": "harshitamaratha035@gmail.com", "full_name": "Harshita Maratha ", "email_verified": true, "phone_verified": false}', 'email', '2026-01-09 16:14:20.408264+00', '2026-01-09 16:14:20.408313+00', '2026-01-09 16:14:20.408313+00', 'd6ab76a7-81d8-41ea-8468-444dd68c7cc8'),
	('6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b', '6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b', '{"sub": "6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b", "email": "techatvision@gmail.com", "full_name": "Jhon Doe", "email_verified": false, "phone_verified": false}', 'email', '2026-01-24 17:49:52.835574+00', '2026-01-24 17:49:52.835625+00', '2026-01-24 17:49:52.835625+00', 'd212507e-b9fe-494a-94c0-aacd1a3efaa0'),
	('fd4f2503-e40a-41d9-a124-b95f68f204fb', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', '{"sub": "fd4f2503-e40a-41d9-a124-b95f68f204fb", "email": "tanishamaratha12@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-02 10:04:32.865843+00', '2026-02-02 10:04:32.865905+00', '2026-02-02 10:04:32.865905+00', 'dd929f83-8bf3-42a8-a4f3-c375c2ba1171');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('beff7b9b-634b-4bcb-900e-5746576b1c76', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 19:28:06.100318+00', '2026-02-07 19:28:06.100318+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '49.43.178.46', NULL, NULL, NULL, NULL, NULL),
	('5f29eb3d-4ea3-410e-892d-f5f3aae24aff', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 19:29:04.044423+00', '2026-02-07 19:29:04.044423+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '49.43.178.46', NULL, NULL, NULL, NULL, NULL),
	('115b5580-f0e9-4fea-9631-d9838d42b33a', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 19:29:10.298424+00', '2026-02-07 19:29:10.298424+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '49.43.178.46', NULL, NULL, NULL, NULL, NULL),
	('3be13d94-30c6-41fc-acd2-16491482faf8', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 18:02:36.379769+00', '2026-02-07 20:25:05.512063+00', NULL, 'aal1', NULL, '2026-02-07 20:25:05.511357', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '157.48.216.87', NULL, NULL, NULL, NULL, NULL),
	('cfac64cf-2617-47c4-ae43-e5dde56118c4', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', '2026-02-02 10:05:05.35801+00', '2026-02-02 11:03:32.925392+00', NULL, 'aal1', NULL, '2026-02-02 11:03:32.925273', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '110.226.175.129', NULL, NULL, NULL, NULL, NULL),
	('f58d3bc4-5f9a-49d8-8ebe-0be580923720', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 19:32:50.473336+00', '2026-02-08 09:53:33.985856+00', NULL, 'aal1', NULL, '2026-02-08 09:53:33.985746', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '49.43.178.46', NULL, NULL, NULL, NULL, NULL),
	('027216f7-2d46-4bdb-bfa8-5426d7f00df7', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 19:43:18.952437+00', '2026-02-08 10:11:10.641115+00', NULL, 'aal1', NULL, '2026-02-08 10:11:10.640986', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '49.43.178.46', NULL, NULL, NULL, NULL, NULL),
	('765aa186-e4b8-4bfc-b572-e178dbbb2fd8', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 16:36:37.032848+00', '2026-02-08 10:57:10.048963+00', NULL, 'aal1', NULL, '2026-02-08 10:57:10.04885', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '157.48.205.163', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('765aa186-e4b8-4bfc-b572-e178dbbb2fd8', '2026-02-07 16:36:37.118902+00', '2026-02-07 16:36:37.118902+00', 'password', '2a3cb158-54b7-4101-8cdb-38f7da5a1faf'),
	('3be13d94-30c6-41fc-acd2-16491482faf8', '2026-02-07 18:02:36.464783+00', '2026-02-07 18:02:36.464783+00', 'password', '5a6e1afd-a6e1-4bf6-9187-cb7805de620d'),
	('beff7b9b-634b-4bcb-900e-5746576b1c76', '2026-02-07 19:28:06.167482+00', '2026-02-07 19:28:06.167482+00', 'password', 'ca9bad91-0c49-4708-bbd4-84131b24f25b'),
	('5f29eb3d-4ea3-410e-892d-f5f3aae24aff', '2026-02-07 19:29:04.052066+00', '2026-02-07 19:29:04.052066+00', 'password', 'c0902149-4e36-4b0d-868a-652037d06ca2'),
	('115b5580-f0e9-4fea-9631-d9838d42b33a', '2026-02-07 19:29:10.301619+00', '2026-02-07 19:29:10.301619+00', 'password', '9234f73b-85a8-4142-9631-9d160084968f'),
	('f58d3bc4-5f9a-49d8-8ebe-0be580923720', '2026-02-07 19:32:50.516722+00', '2026-02-07 19:32:50.516722+00', 'password', '69a33e1a-d794-4a84-9287-a641acb6f4f4'),
	('027216f7-2d46-4bdb-bfa8-5426d7f00df7', '2026-02-07 19:43:18.95992+00', '2026-02-07 19:43:18.95992+00', 'password', 'f1de0885-d5bc-42a4-9a3b-159b1c253f9f'),
	('cfac64cf-2617-47c4-ae43-e5dde56118c4', '2026-02-02 10:05:05.384921+00', '2026-02-02 10:05:05.384921+00', 'password', 'a8f7fd96-e8a6-428e-8c76-af43d68a078c');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('aec37e09-3295-4f50-9be9-1555a8edf477', '6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b', 'confirmation_token', '7f8a567c26f002080bcb7f2832269fdfed2c6b25638b6cc86073942c', 'techatvision@gmail.com', '2026-01-24 17:49:55.516527', '2026-01-24 17:49:55.516527');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 220, 'k6w7a77wvw5a', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 16:36:37.077143+00', '2026-02-07 17:35:18.118598+00', NULL, '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 221, 'ufiqninzbrtv', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 17:35:18.137313+00', '2026-02-07 18:33:26.840907+00', 'k6w7a77wvw5a', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 224, 'eczhhqplfn7r', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-07 19:28:06.132473+00', '2026-02-07 19:28:06.132473+00', NULL, 'beff7b9b-634b-4bcb-900e-5746576b1c76'),
	('00000000-0000-0000-0000-000000000000', 225, 'b6bnkkgaztwe', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-07 19:29:04.047477+00', '2026-02-07 19:29:04.047477+00', NULL, '5f29eb3d-4ea3-410e-892d-f5f3aae24aff'),
	('00000000-0000-0000-0000-000000000000', 226, 'hylzbxu3rz6t', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-07 19:29:10.299677+00', '2026-02-07 19:29:10.299677+00', NULL, '115b5580-f0e9-4fea-9631-d9838d42b33a'),
	('00000000-0000-0000-0000-000000000000', 223, 'yl5y6nhbacml', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 18:33:26.848978+00', '2026-02-07 20:19:13.207819+00', 'ufiqninzbrtv', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 222, 'h4ir3fiti5iw', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 18:02:36.422968+00', '2026-02-07 20:25:05.491773+00', NULL, '3be13d94-30c6-41fc-acd2-16491482faf8'),
	('00000000-0000-0000-0000-000000000000', 230, 'pmze2wsh3feb', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-07 20:25:05.493662+00', '2026-02-07 20:25:05.493662+00', 'h4ir3fiti5iw', '3be13d94-30c6-41fc-acd2-16491482faf8'),
	('00000000-0000-0000-0000-000000000000', 228, '6j4jo2ay7ous', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 19:43:18.955896+00', '2026-02-07 20:41:54.94592+00', NULL, '027216f7-2d46-4bdb-bfa8-5426d7f00df7'),
	('00000000-0000-0000-0000-000000000000', 229, 'kzsihs4or2qg', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 20:19:13.2204+00', '2026-02-07 21:18:29.016241+00', 'yl5y6nhbacml', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 204, 'mxw7l5l7q7ni', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', true, '2026-02-02 10:05:05.37061+00', '2026-02-02 11:03:32.873395+00', NULL, 'cfac64cf-2617-47c4-ae43-e5dde56118c4'),
	('00000000-0000-0000-0000-000000000000', 205, 'bpqu7mjklg6x', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', false, '2026-02-02 11:03:32.896095+00', '2026-02-02 11:03:32.896095+00', 'mxw7l5l7q7ni', 'cfac64cf-2617-47c4-ae43-e5dde56118c4'),
	('00000000-0000-0000-0000-000000000000', 227, 'xlhvmdqdkbwi', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 19:32:50.504124+00', '2026-02-08 04:29:57.758116+00', NULL, 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 233, 'img3xsifbxkw', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 04:29:57.784031+00', '2026-02-08 05:29:26.171521+00', 'xlhvmdqdkbwi', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 234, '2tdd6ys2xsqt', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 05:29:26.187922+00', '2026-02-08 06:42:49.6647+00', 'img3xsifbxkw', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 235, 'alet3oykfhjv', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 06:42:49.689047+00', '2026-02-08 07:44:40.156337+00', '2tdd6ys2xsqt', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 236, 'xu5ob3ordftt', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 07:44:40.175175+00', '2026-02-08 08:43:18.254508+00', 'alet3oykfhjv', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 232, 'gevfrpdvrdlp', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 21:18:29.02779+00', '2026-02-08 09:00:18.565162+00', 'kzsihs4or2qg', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 237, 'qpund42fdt42', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 08:43:18.276969+00', '2026-02-08 09:53:33.933053+00', 'xu5ob3ordftt', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 239, 'kzifek7dh5nk', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-08 09:53:33.956086+00', '2026-02-08 09:53:33.956086+00', 'qpund42fdt42', 'f58d3bc4-5f9a-49d8-8ebe-0be580923720'),
	('00000000-0000-0000-0000-000000000000', 238, 'jz7gshises34', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 09:00:18.583285+00', '2026-02-08 09:58:39.110685+00', 'gevfrpdvrdlp', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 231, 'qlv7v2bsusmx', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-07 20:41:54.960513+00', '2026-02-08 10:11:10.611096+00', '6j4jo2ay7ous', '027216f7-2d46-4bdb-bfa8-5426d7f00df7'),
	('00000000-0000-0000-0000-000000000000', 241, '33yljddf62lb', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-08 10:11:10.623296+00', '2026-02-08 10:11:10.623296+00', 'qlv7v2bsusmx', '027216f7-2d46-4bdb-bfa8-5426d7f00df7'),
	('00000000-0000-0000-0000-000000000000', 240, '55uqyvzmd3hd', '14814863-7a39-4852-b3cd-8f4395c476d8', true, '2026-02-08 09:58:39.1129+00', '2026-02-08 10:57:10.025895+00', 'jz7gshises34', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8'),
	('00000000-0000-0000-0000-000000000000', 242, 'okq3xlyenh2m', '14814863-7a39-4852-b3cd-8f4395c476d8', false, '2026-02-08 10:57:10.031694+00', '2026-02-08 10:57:10.031694+00', '55uqyvzmd3hd', '765aa186-e4b8-4bfc-b572-e178dbbb2fd8');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "phone", "avatar_url", "role", "created_at") VALUES
	('bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', 'Jignesh Ameta', '7691848733', NULL, 'customer', '2025-12-29 09:54:20.751727+00'),
	('14814863-7a39-4852-b3cd-8f4395c476d8', 'Administrator', '7691848733', NULL, 'admin', '2026-01-01 17:01:49.75286+00'),
	('cac70c0f-a58b-46ab-bc26-f2c415409ce9', 'Harshita Maratha ', '7742013275', NULL, 'customer', '2026-01-09 16:14:20.334725+00'),
	('6a3fb8c7-81dd-4d04-b8ba-a63930c2d06b', 'Jhon Doe', NULL, NULL, 'customer', '2026-01-24 17:49:52.830344+00'),
	('fd4f2503-e40a-41d9-a124-b95f68f204fb', NULL, NULL, NULL, 'customer', '2026-02-02 10:04:32.862201+00');


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."addresses" ("id", "user_id", "type", "is_default", "name", "phone", "street", "city", "state", "pincode", "country", "created_at", "updated_at") VALUES
	('40a254d7-e19d-4882-a6f5-7c378738aba3', 'bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', 'shipping', true, 'Jignesh Ameta', '7691848733', 'bhadsoda', 'chittorgarh', 'rajasthan', '312024', 'India', '2026-02-06 20:01:10.347071+00', '2026-02-06 20:01:10.347071+00'),
	('65bb7a7e-b5f8-42b9-a470-753355b4870e', 'bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', 'billing', true, 'Jignesh Ameta', '7691848733', 'bhadsoda', 'Udaipur', 'rajasthan', '313001', 'India', '2026-02-06 20:01:36.278557+00', '2026-02-06 20:01:36.278557+00');


--
-- Data for Name: bulk_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bulk_inquiries" ("id", "company_name", "contact_name", "email", "phone", "business_type", "estimated_volume", "products_interested", "message", "status", "created_at", "address", "pincode") VALUES
	('162703ba-c529-43bd-a819-8a9545f6e077', 'vitc', 'jignesh ameta', 'jignesh.vision.17@gmail.com', '7691848733', 'restaurant', '5-10kg', 'Masala Chai', 'need pricing details as wholesaler rates', 'new', '2026-01-12 16:43:35.873901+00', 'Udaipur,Rajasthan,India', '313001'),
	('ac420117-c341-4921-92a8-c2bdf51875db', 'HRC Suppliers', 'jignesh ameta', 'admin@aonetop.com', '7691848733', 'distributor', '100kg+', 'Masala Chai', 'provide  details so we can do business', 'new', '2026-01-12 16:45:44.7732+00', 'Bhilwara,Rajasthan,India', '312025');


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."carts" ("id", "user_id", "created_at") VALUES
	('05a8180b-b206-4630-a240-593b5e0bbb2d', 'bb6fc3e9-21a2-45c3-b183-af1af0a0bd28', '2025-12-29 13:45:30.889839+00'),
	('570b2a32-4e0c-4fd9-acae-50349a82a74e', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-01-01 17:02:46.43172+00'),
	('c5e719d4-9998-4740-94c2-1b29168a7736', 'cac70c0f-a58b-46ab-bc26-f2c415409ce9', '2026-01-09 16:14:50.479478+00'),
	('6f059402-f5c7-4027-ac39-a3061ba8c74c', 'fd4f2503-e40a-41d9-a124-b95f68f204fb', '2026-02-02 10:05:07.352876+00');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "name", "slug", "description", "long_description", "price", "original_price", "category", "product_type", "weight_category", "tags", "weight", "in_stock", "is_bestseller", "is_featured", "is_new", "rating", "reviews_count", "created_at") VALUES
	('3b7ff71f-4e8c-46ff-88f6-3b722701d16d', 'Pure Ajwain Organic Honey', 'pure-ajwain-organic-honey', 'Natural honey infused with ajwain known for digestive and medicinal benefits.', 'Our Ajwain Honey is made from pure, natural honey blended with the goodness of ajwain. It supports digestion, helps relieve cough and cold, and boosts immunity. Free from chemicals and preservatives, this honey is perfect for daily use in warm water, tea, or home remedies.', 150000, 180000, 'Honey', 'loose-leaf', 'medium', '{spiced,traditional,strong}', '250g', true, true, false, false, 4.8, 234, '2025-12-29 09:51:09.623592+00'),
	('8894e456-d9f7-487b-bd57-9d4ac5f92e13', 'Jaggery Cardamom Chai', 'jaggery-cardamom-chai', 'A healthy blend of premium tea with natural jaggery and aromatic cardamom for a rich, traditional taste.', 'Experience the authentic taste of India with our Natural Jaggery Cardamom Chai. Made from carefully selected tea leaves, pure jaggery, and fragrant cardamom, this tea delivers natural sweetness and soothing flavor in every sip. Jaggery helps provide energy and aids digestion, while cardamom enhances aroma and taste. Perfect for daily consumption, this tea is a healthier alternative to sugar-based chai.', 13000, 18000, 'Tea', 'loose-leaf', 'small', '{rare,premium,limited-edition}', '250g', true, false, false, true, 5.0, 42, '2025-12-29 09:51:09.623592+00'),
	('c8988f63-33d7-4b6a-a550-36e06e024167', 'Elaichi Chai', 'elaichi-chai', 'Classic tea blended with aromatic cardamom for a refreshing and flavorful experience.', 'Our Premium Elaichi Chai combines high-quality tea leaves with the natural fragrance of green cardamom. It provides a rich taste, refreshing aroma, and soothing effect. Ideal for morning and evening tea lovers, this blend delivers a traditional flavor loved across India.', 13000, 17500, 'Tea', 'loose-leaf', 'medium', '{organic,breakfast,strong}', '250g', true, true, false, false, 4.8, 95, '2025-12-29 09:51:09.623592+00'),
	('89c357f3-fb99-4e6d-8362-f76e2f81cda1', 'Tulsi Adrak Chai', 'tulsi-adrak-chai', 'Herbal tea infused with tulsi and ginger to support immunity and provide refreshing flavor.', 'Tulsi Adrak Chai is a powerful blend of natural tea leaves, holy basil (tulsi), and fresh ginger. Known for their medicinal properties, tulsi supports immunity and ginger helps digestion and relieves cold symptoms. This tea is perfect for starting your day with freshness and wellness. Enjoy a strong, aromatic cup that combines health and taste.', 13000, 15000, 'Tea', 'loose-leaf', 'medium', '{caffeine-free,ayurvedic,wellness}', '250g', true, false, false, false, 4.7, 78, '2025-12-29 09:51:09.623592+00'),
	('4b9c3117-96b1-4f7a-b84a-5604e8c1fb3e', 'Cow Ghee', 'cow-ghee', '100% pure cow ghee made using traditional methods for rich taste and nutrition.', 'Prepared from high-quality cow milk, our Traditional Pure Cow Ghee is rich in aroma, taste, and nutrition. Made using traditional techniques, it contains essential vitamins and healthy fats. Ideal for cooking, and daily consumption, it enhances flavor and promotes overall health.', 75000, 76994, 'Ghee', NULL, NULL, NULL, '1Kg', true, false, false, false, 0.0, 0, '2026-02-08 07:26:19.17723+00'),
	('639ca45a-6453-4482-8bfc-2dd22e9e1921', 'Premium A2 Gir Cow Ghee', 'premium-a2-gir-cow-ghee', 'Handcrafted A2 ghee made from Gir cow milk using the traditional bilona process.', 'Our Premium A2 Gir Cow Ghee is made from the milk of pure Gir cows. It is rich in A2 nutrients, easy to digest, and supports immunity, brain health, and strength. With a natural aroma and golden texture, it is perfect for healthy cooking and daily nutrition.', 150000, 155000, 'Ghee', NULL, NULL, NULL, '1Kg', true, true, false, false, 0.0, 0, '2026-02-08 07:29:15.312961+00'),
	('20b12b64-d31b-4423-8461-f74fa7530ad5', 'Masala Chai', 'masala-chai', 'Strong and flavorful tea blended with traditional Indian spices.', 'Enjoy the bold taste of Authentic Indian Masala Chai made from premium tea leaves and traditional spices like cardamom, ginger, clove, and cinnamon. This blend gives a strong aroma, energizing taste, and comforting warmth. Perfect for tea lovers who enjoy spicy and rich chai.', 12500, 15000, 'Tea', NULL, NULL, NULL, '250g', true, false, false, false, 0.0, 0, '2026-02-08 07:32:47.075672+00');


--
-- Data for Name: product_weight_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_weight_variants" ("id", "product_id", "weight", "price", "original_price", "stock_quantity", "in_stock", "sort_order", "created_at") VALUES
	('8b776ef1-58cd-4efb-81fd-6bda1b8a77e4', '3b7ff71f-4e8c-46ff-88f6-3b722701d16d', '250g', 15000, NULL, NULL, true, 0, '2026-02-08 07:05:24.572755+00'),
	('c4f016a2-9625-4dd6-aab3-c3e3bac53701', '3b7ff71f-4e8c-46ff-88f6-3b722701d16d', '500g', 27500, NULL, NULL, true, 0, '2026-02-08 07:16:32.584682+00'),
	('d3665f9d-366e-4883-9003-d7583c1ab5f1', '3b7ff71f-4e8c-46ff-88f6-3b722701d16d', '1Kg', 50000, 55000, NULL, true, 0, '2026-02-08 07:18:50.800759+00');


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "description", "sort_order", "parent_id", "image_url") VALUES
	('tea', 'Tea', 'Premium tea collection including domestic and masala varieties', 1, NULL, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80'),
	('tea-domestic', 'Domestic Tea', 'Traditional domestic tea varieties', 2, 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'),
	('honey', 'Honey', 'Pure and natural honey products', 4, NULL, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80'),
	('ghee', 'Ghee', 'Premium ghee and clarified butter', 5, NULL, 'https://images.unsplash.com/photo-1631963416786-c715c7b358dd?w=600&q=80'),
	('flavoured-tea', 'Flavoured Tea', NULL, 3, 'tea', NULL);


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contact_messages" ("id", "name", "email", "phone", "subject", "message", "is_read", "created_at") VALUES
	('e4ca903e-a3c2-4437-b44d-21d414782561', 'Welcome Discount', 'jignesh.vision.17@gmail.com', '7691848733', 'how are you', 'hjhkjk', true, '2025-12-30 13:29:16.972089+00'),
	('13be90f6-a454-4293-965b-8b996a76fc62', 'Welcome Discount', 'jignesh.vision.17@gmail.com', '7691848733', 'how are you', 'asdas', false, '2025-12-30 13:28:18.640906+00'),
	('f090d887-d973-4468-a4ce-a9319a89bf78', 'Ajay', 'nn@gmail.com', '8562142365', 'HOw can I ', 'HEllooooooooooo', false, '2026-01-30 08:34:59.853421+00');


--
-- Data for Name: notification_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notification_templates" ("id", "name", "display_name", "notification_type", "channel", "subject", "body", "variables", "status", "version", "is_system_template", "created_by", "updated_by", "created_at", "updated_at") VALUES
	('a0968379-7462-4988-8c9d-e05e4cccdfb1', 'signup_welcome_email', 'Welcome Email', 'account_signup', 'email', 'Welcome to AONet - Your Account is Ready! 🎉', '<h1>Welcome {{user_name}}!</h1><p>Your account has been successfully created. Click the button below to explore our premium tea collection.</p><a href="{{activation_link}}">Activate Your Account</a>', '["user_name", "activation_link"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('be67377d-c1c9-49ab-bdbe-297c9ac91806', 'password_reset_email', 'Password Reset Email', 'password_reset', 'email', 'Reset Your AONet Password', '<h1>Password Reset Request</h1><p>Click the link below to reset your password. This link is valid for 24 hours.</p><a href="{{reset_link}}">Reset Password</a><p>If you didn''t request this, please ignore this email.</p>', '["reset_link", "expiry_time"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('3d90cc17-c364-42b4-bd74-72940da45caa', 'order_confirmation_email', 'Order Confirmation Email', 'order_confirmation', 'email', 'Order Confirmed - Order #{{order_id}}', '<h1>Your Order is Confirmed! ✓</h1><p>Order ID: {{order_id}}</p><p>Total: ₹{{total}}</p><p>Estimated Delivery: {{delivery_date}}</p><a href="{{order_link}}">View Order Details</a>', '["order_id", "total", "delivery_date", "order_link"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('17b8ec69-3961-4654-8068-447360fb3167', 'payment_confirmation_email', 'Payment Confirmation Email', 'payment_confirmation', 'email', 'Payment Successful - Order #{{order_id}}', '<h1>Payment Received! ✓</h1><p>Payment of ₹{{amount}} received for Order #{{order_id}}</p><p>Transaction ID: {{transaction_id}}</p><p>Your order is being prepared.</p>', '["order_id", "amount", "transaction_id"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('a3aaf37d-7c90-4080-bdaf-ea63685c271e', 'order_shipped_email', 'Order Shipped Email', 'order_tracking', 'email', 'Order #{{order_id}} Has Been Shipped 📦', '<h1>Your Order is on the Way!</h1><p>Order ID: {{order_id}}</p><p>Tracking Number: {{tracking_number}}</p><a href="{{tracking_link}}">Track Your Package</a>', '["order_id", "tracking_number", "tracking_link"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('a75674bd-cf03-4164-a1ca-c3b233873cdb', 'order_delivered_email', 'Order Delivered Email', 'order_delivered', 'email', 'Order #{{order_id}} Delivered 🎉', '<h1>Your Order Has Been Delivered!</h1><p>Please rate and review your purchase to help us improve.</p><a href="{{review_link}}">Share Your Feedback</a>', '["order_id", "review_link"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00'),
	('1b66f8f2-9b3b-47ff-a21b-c01f11f74684', 'cart_reminder_email', 'Cart Reminder Email', 'cart_reminder', 'email', 'Don''t Miss Out! Complete Your Order', '<h1>Items waiting in your cart!</h1><p>You have {{item_count}} items worth ₹{{cart_total}} in your cart.</p><a href="{{checkout_link}}">Complete Your Purchase</a><p>This offer expires in {{expires_in}} hours.</p>', '["item_count", "cart_total", "checkout_link", "expires_in"]', 'active', 1, true, NULL, NULL, '2026-01-24 13:17:37.387277+00', '2026-01-24 13:17:37.387277+00');


--
-- Data for Name: notification_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notification_rate_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notification_template_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."offers" ("id", "name", "code", "type", "value", "min_order_value", "max_discount", "applies_to", "is_active", "starts_at", "ends_at", "usage_limit", "used_count", "created_at", "per_user_limit") VALUES
	('27af2caf-0cbe-40fa-a63f-e13812c9e761', 'Welcome Discount', 'WELCOME10', 'percentage', 10, 99900, NULL, 'all', true, '2025-12-29 09:51:09.623592+00', '2026-12-29 09:51:09.623592+00', NULL, 0, '2025-12-29 09:51:09.623592+00', NULL),
	('49542b30-4ed5-4e91-a934-c679c66cd565', 'Free Shipping', 'FREESHIP', 'free_shipping', NULL, 99900, NULL, 'all', true, '2025-12-29 09:51:09.623592+00', '2026-06-29 09:51:09.623592+00', NULL, 0, '2025-12-29 09:51:09.623592+00', NULL),
	('6f92c75e-3f8f-445c-82d4-08fbb43e5dba', 'New Year Sale', 'NEWYEAR25', 'percentage', 25, 199900, NULL, 'all', true, '2025-12-29 09:51:09.623592+00', '2025-01-31 23:59:59+00', NULL, 0, '2025-12-29 09:51:09.623592+00', NULL),
	('20cf599e-2368-45a2-9006-a2519eb990fe', 'Independence Offer', 'INDEPENDENCE26', 'percentage', 15, 100000, NULL, 'all', true, '2026-01-23 00:00:00+00', '2026-01-27 00:00:00+00', 2, 0, '2026-01-23 16:31:08.579088+00', NULL);


--
-- Data for Name: offer_products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: offer_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: order_counters; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_counters" ("year", "counter") VALUES
	(2026, 15);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_images" ("id", "product_id", "url", "is_primary", "sort_order") VALUES
	('5ed98256-1147-4ab6-b799-ff0e12d75d27', '8894e456-d9f7-487b-bd57-9d4ac5f92e13', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/8894e456-d9f7-487b-bd57-9d4ac5f92e13/1770533159718.png', false, 0),
	('f540a8f3-ad5e-4c0c-a987-6316fbf9f921', '89c357f3-fb99-4e6d-8362-f76e2f81cda1', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/89c357f3-fb99-4e6d-8362-f76e2f81cda1/1770533453773.png', false, 0),
	('b21e256a-f012-467e-8e37-0c587f61c3e5', 'c8988f63-33d7-4b6a-a550-36e06e024167', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/c8988f63-33d7-4b6a-a550-36e06e024167/1770533580560.png', false, 0),
	('23ed3055-8bd0-4f74-b782-1dfab85e6c69', '3b7ff71f-4e8c-46ff-88f6-3b722701d16d', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/3b7ff71f-4e8c-46ff-88f6-3b722701d16d/1770534261013.png', false, 0),
	('cc19f7ae-17e4-4da2-8a72-d47620ecaa59', '4b9c3117-96b1-4f7a-b84a-5604e8c1fb3e', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/4b9c3117-96b1-4f7a-b84a-5604e8c1fb3e/1770535598860.png', true, 0),
	('baef43f9-f3d7-4fea-8a83-4a46d4c7cba3', '639ca45a-6453-4482-8bfc-2dd22e9e1921', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/639ca45a-6453-4482-8bfc-2dd22e9e1921/1770535760118.png', true, 0),
	('88cfdd0c-ccba-4d7a-b5ca-967f9a5a5a89', '20b12b64-d31b-4423-8461-f74fa7530ad5', 'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/product-images/tea-products/20b12b64-d31b-4423-8461-f74fa7530ad5/1770536004182.png', false, 0);


--
-- Data for Name: user_contact_info; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('product-images', 'product-images', NULL, '2025-12-30 16:15:58.620602+00', '2025-12-30 16:15:58.620602+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('content-images', 'content-images', NULL, '2026-02-06 17:03:28.105617+00', '2026-02-06 17:03:28.105617+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('cate_videos', 'cate_videos', NULL, '2026-02-08 10:59:31.744077+00', '2026-02-08 10:59:31.744077+00', false, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('339399ea-7d79-43bf-9734-85a484652176', 'product-images', '.emptyFolderPlaceholder', NULL, '2026-01-01 17:20:01.334621+00', '2026-01-01 17:20:01.334621+00', '2026-01-01 17:20:01.334621+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-01T17:20:01.333Z", "contentLength": 0, "httpStatusCode": 200}', '00ee0dea-249d-4f9c-bf96-fd8b994c8b33', NULL, '{}', 1),
	('dda95375-a089-451c-a058-686a95e902b2', 'content-images', 'about_top.jpeg', NULL, '2026-02-06 18:07:33.188375+00', '2026-02-06 18:07:33.188375+00', '2026-02-06 18:07:33.188375+00', '{"eTag": "\"be022239c88fab9015cb89d6be4c8d9f-1\"", "size": 15215, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T18:07:33.000Z", "contentLength": 15215, "httpStatusCode": 200}', 'd8bfc15f-4f4a-4019-847e-d0f8f8c66e12', NULL, NULL, 1),
	('799e3059-7785-4f58-a748-5e35dc0efd39', 'product-images', 'honey-products/.emptyFolderPlaceholder', NULL, '2026-01-01 17:20:16.856628+00', '2026-01-01 17:22:28.530764+00', '2026-01-01 17:20:16.856628+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-01T17:22:29.000Z", "contentLength": 0, "httpStatusCode": 200}', '8a572789-0628-4c72-a4b6-063876dbeadb', NULL, '{}', 2),
	('a0b15d25-eefc-42f7-bf12-22437b620223', 'product-images', 'tea-products/.emptyFolderPlaceholder', NULL, '2026-01-01 17:20:06.824683+00', '2026-01-01 17:22:36.901624+00', '2026-01-01 17:20:06.824683+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-01T17:22:37.000Z", "contentLength": 0, "httpStatusCode": 200}', '6443c375-203e-4c16-a9ea-ad05cb5e40de', NULL, '{}', 2),
	('6acec0ab-7ab5-4a89-8a39-568a60c15b69', 'content-images', 'home-slider/1770495255655-ixtbvj.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 20:14:16.792581+00', '2026-02-07 20:14:16.792581+00', '2026-02-07 20:14:16.792581+00', '{"eTag": "\"497bd61376ba34ac687dd0471413232e\"", "size": 1342209, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T20:14:17.000Z", "contentLength": 1342209, "httpStatusCode": 200}', 'f75357bd-6f96-4ed3-ba84-1ac84745319d', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('895a7657-e725-47f1-9744-7c0fdb6e2d91', 'content-images', 'home-slider/1770498898074-j5sfn6.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 21:14:58.892358+00', '2026-02-07 21:14:58.892358+00', '2026-02-07 21:14:58.892358+00', '{"eTag": "\"8b793ebb2e9f67d42c84894371a43e6f\"", "size": 1338510, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T21:14:59.000Z", "contentLength": 1338510, "httpStatusCode": 200}', 'd20780c7-9379-4e66-8d80-1cf8f93802bb', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('8e4d2def-df96-40ff-8cc0-3e1240ba2508', 'product-images', 'tea-products/89c357f3-fb99-4e6d-8362-f76e2f81cda1/1770533453773.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 06:50:54.047117+00', '2026-02-08 06:50:54.047117+00', '2026-02-08 06:50:54.047117+00', '{"eTag": "\"c0dfaeafdf4abe04a991c98669d53fa7\"", "size": 112776, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T06:50:55.000Z", "contentLength": 112776, "httpStatusCode": 200}', 'df344d77-62ec-454e-9994-26d88e0081a8', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('5b2b2920-a1b9-4957-9728-652a25dffa70', 'product-images', 'tea-products/c8988f63-33d7-4b6a-a550-36e06e024167/1770533580560.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 06:53:01.084416+00', '2026-02-08 06:53:01.084416+00', '2026-02-08 06:53:01.084416+00', '{"eTag": "\"7d72a2f2ddb49042237dfadf039e75d7\"", "size": 111503, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T06:53:02.000Z", "contentLength": 111503, "httpStatusCode": 200}', 'a600bf9e-cf7f-4934-bf66-69e0434d6a91', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('7c4ced74-3b39-4fa5-b4e4-d7988540c060', 'content-images', 'about-slider/.emptyFolderPlaceholder', NULL, '2026-02-06 17:08:59.094948+00', '2026-02-06 17:08:59.094948+00', '2026-02-06 17:08:59.094948+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T17:08:59.100Z", "contentLength": 0, "httpStatusCode": 200}', '887d8269-778b-4cd3-81ba-28f96575e631', NULL, '{}', 2),
	('46aed96e-217f-442c-b12d-38ba151f6c1e', 'content-images', '1770398058721-hcd9e.ico', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:14:18.987176+00', '2026-02-06 17:14:18.987176+00', '2026-02-06 17:14:18.987176+00', '{"eTag": "\"3f1fe81efbd4a92424fd67daf3aec143\"", "size": 32969, "mimetype": "image/vnd.microsoft.icon", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:14:19.000Z", "contentLength": 32969, "httpStatusCode": 200}', 'cc789786-8915-4c79-acc2-b88d9d458de9', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 1),
	('8e148612-3a9d-40d1-aa0a-f37a4ffe5a6e', 'content-images', '1770398113204-rqzbzn.ico', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:15:13.401786+00', '2026-02-06 17:15:13.401786+00', '2026-02-06 17:15:13.401786+00', '{"eTag": "\"3f1fe81efbd4a92424fd67daf3aec143\"", "size": 32969, "mimetype": "image/vnd.microsoft.icon", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:15:14.000Z", "contentLength": 32969, "httpStatusCode": 200}', '1491475a-6c41-4525-b8a0-eb43b9766cf6', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 1),
	('723e6624-934c-4516-82f4-7ba158e17b6a', 'cate_videos', 'tea.mp4', NULL, '2026-02-08 11:00:13.969912+00', '2026-02-08 11:00:13.969912+00', '2026-02-08 11:00:13.969912+00', '{"eTag": "\"d93cd3d394eda7bb5fd08ac2d473fe04-1\"", "size": 436158, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T11:00:14.000Z", "contentLength": 436158, "httpStatusCode": 200}', 'cbd89b77-3d05-48af-8cc6-4149ee3a10d7', NULL, NULL, 1),
	('f5717fa7-da24-4d97-9154-ea5b91af6eec', 'content-images', 'site-settings/.emptyFolderPlaceholder', NULL, '2026-02-06 17:19:49.930051+00', '2026-02-06 17:19:49.930051+00', '2026-02-06 17:19:49.930051+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T17:19:49.935Z", "contentLength": 0, "httpStatusCode": 200}', 'e93120bb-70f9-403a-92f7-cdcd316faaf8', NULL, '{}', 2),
	('b213df53-6650-4fd7-ac9c-d01634215064', 'content-images', '1770398414387-mmjuad.ico', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:20:14.694801+00', '2026-02-06 17:20:14.694801+00', '2026-02-06 17:20:14.694801+00', '{"eTag": "\"3f1fe81efbd4a92424fd67daf3aec143\"", "size": 32969, "mimetype": "image/vnd.microsoft.icon", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:20:15.000Z", "contentLength": 32969, "httpStatusCode": 200}', '1a16b276-73b8-4823-a4a2-6abd10d2e475', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 1),
	('cc9e34db-82cf-4988-b686-61ed32e21834', 'content-images', '1770485546469-uxqykn.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 17:32:26.89373+00', '2026-02-07 17:32:26.89373+00', '2026-02-07 17:32:26.89373+00', '{"eTag": "\"2d24c6f7846dfab8b27b587894fc0960\"", "size": 130959, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T17:32:27.000Z", "contentLength": 130959, "httpStatusCode": 200}', '605648b4-a98f-4e9b-ba11-8bbe391adf57', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 1),
	('6acb0e6d-bf59-4a6f-939f-41b47819ad2b', 'content-images', 'v982-d3-04-removebg-preview.png', NULL, '2026-02-07 21:18:13.63228+00', '2026-02-07 21:18:13.63228+00', '2026-02-07 21:18:13.63228+00', '{"eTag": "\"a4859dd6dde1c2bcfb312fdc1b160e9f-1\"", "size": 148243, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T21:18:14.000Z", "contentLength": 148243, "httpStatusCode": 200}', '1b0877fd-c72e-4a2b-8dd3-47bd1fa46785', NULL, NULL, 1),
	('95442bec-7b00-4608-99cd-3c4a2a16c2b6', 'content-images', 'home-slider/1770496649987-60yysq.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 20:37:30.616336+00', '2026-02-07 20:37:30.616336+00', '2026-02-07 20:37:30.616336+00', '{"eTag": "\"a9e21180992b5117a3835397ecb3dfb5\"", "size": 168383, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T20:37:31.000Z", "contentLength": 168383, "httpStatusCode": 200}', '69295ffe-af59-47e8-b84c-87bc4eb7bfdc', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('fc910fff-5dfd-4204-bc21-872ff47c11c7', 'content-images', 'about-slider/1770407507709-wgbc4f.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 19:51:48.723524+00', '2026-02-06 19:51:48.723524+00', '2026-02-06 19:51:48.723524+00', '{"eTag": "\"3a2bfeb2a057438a05b5732eff6cef9b\"", "size": 24284, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T19:51:49.000Z", "contentLength": 24284, "httpStatusCode": 200}', '0cc5e535-2762-412f-9369-a5f26e87d769', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('b6fab8c4-1fc6-4e04-aa95-78e890776130', 'content-images', 'f79920f4cb34986684e29df42ec0cebe.jpg', NULL, '2026-02-07 21:12:21.838998+00', '2026-02-07 21:12:21.838998+00', '2026-02-07 21:12:21.838998+00', '{"eTag": "\"4d0a52a7b830829e6353643a93bd9ad2-1\"", "size": 10917, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T21:12:22.000Z", "contentLength": 10917, "httpStatusCode": 200}', 'c9dac199-169d-4726-b30d-9ccbd2dcb6af', NULL, NULL, 1),
	('53e6ac8a-5924-4d03-9956-5fbe523b7416', 'content-images', 'site-settings/content.json', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:23:02.841908+00', '2026-02-07 21:15:17.905567+00', '2026-02-06 17:23:02.841908+00', '{"eTag": "\"8936cdd9b04f2ac049859f056dd4c3e5\"", "size": 2012, "mimetype": "application/json", "cacheControl": "max-age=0", "lastModified": "2026-02-07T21:15:18.000Z", "contentLength": 2012, "httpStatusCode": 200}', '8665aeb5-72bc-4644-b1b6-71745371c49d', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('561dd490-97fe-4434-99c8-35b4ee6b27b7', 'content-images', 'about-slider/1770399072017-7o6r1n.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:31:12.227701+00', '2026-02-06 17:31:12.227701+00', '2026-02-06 17:31:12.227701+00', '{"eTag": "\"0e1564e2b333d23e4255e2d9b7ac4c6f\"", "size": 28740, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:31:13.000Z", "contentLength": 28740, "httpStatusCode": 200}', '509dfba4-cfd2-49c0-b0a2-94193902398c', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('00113f56-35a2-4c07-b56b-841f60dcd028', 'content-images', 'about-slider/1770399078340-o6fyzb.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:31:18.514887+00', '2026-02-06 17:31:18.514887+00', '2026-02-06 17:31:18.514887+00', '{"eTag": "\"c324284cb215f847b09a8d3ff7d9c91e\"", "size": 24037, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:31:19.000Z", "contentLength": 24037, "httpStatusCode": 200}', '71d75ad6-471d-4587-ba2e-c70f72ffb507', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('bff2710e-23a0-488b-9928-507e9355f246', 'content-images', 'fb.png', NULL, '2026-02-07 21:20:01.18519+00', '2026-02-07 21:20:01.18519+00', '2026-02-07 21:20:01.18519+00', '{"eTag": "\"dc0fc3ef0a27e220b00188b63f689644-1\"", "size": 39790, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T21:20:01.000Z", "contentLength": 39790, "httpStatusCode": 200}', 'a6d3f617-1759-4d49-89bd-977dd56f780e', NULL, NULL, 1),
	('5b94ee3a-c187-4177-9603-a3a7fe672d65', 'product-images', 'tea-products/3b7ff71f-4e8c-46ff-88f6-3b722701d16d/1770534261013.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 07:04:21.359821+00', '2026-02-08 07:04:21.359821+00', '2026-02-08 07:04:21.359821+00', '{"eTag": "\"3eeadf750523c06a7325106a390650f2\"", "size": 91643, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T07:04:22.000Z", "contentLength": 91643, "httpStatusCode": 200}', '9388bb55-57f4-44ba-8644-5dac27505424', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('2f8ba53e-afde-4070-861f-f547cf65d854', 'content-images', 'home-slider/1770537654186-3j931.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 08:00:54.560255+00', '2026-02-08 08:00:54.560255+00', '2026-02-08 08:00:54.560255+00', '{"eTag": "\"c0dfaeafdf4abe04a991c98669d53fa7\"", "size": 112776, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-08T08:00:55.000Z", "contentLength": 112776, "httpStatusCode": 200}', 'df50b756-35b9-4c2e-ae46-519f6f0e741f', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('87f22aad-de96-4cfd-8ce2-fd69b62b9de6', 'cate_videos', 'ghee.mp4', NULL, '2026-02-08 11:00:14.1957+00', '2026-02-08 11:00:14.1957+00', '2026-02-08 11:00:14.1957+00', '{"eTag": "\"002ed678aac6cfed5b0362eeb5033050-1\"", "size": 1461124, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T11:00:14.000Z", "contentLength": 1461124, "httpStatusCode": 200}', '5b1692d1-5d63-45fc-ba14-c2642474b164', NULL, NULL, 1),
	('4b9175fe-7f07-421b-9683-8cbde2b6aab2', 'content-images', 'home-slider/1770490737421-1muft4.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 18:58:58.361165+00', '2026-02-07 18:58:58.361165+00', '2026-02-07 18:58:58.361165+00', '{"eTag": "\"3c1e50c63efbdd3cc655689c829da956\"", "size": 2106444, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T18:58:59.000Z", "contentLength": 2106444, "httpStatusCode": 200}', '074e7287-b30e-45a6-8a02-9995079c78d2', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('87189ad7-1c24-40c7-b41f-df8bf3c9dd2c', 'content-images', 'home-slider/1770400219127-614fh.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:50:20.53585+00', '2026-02-06 17:50:20.53585+00', '2026-02-06 17:50:20.53585+00', '{"eTag": "\"03d31a33fed7326d87587d6a370f68b0\"", "size": 1795721, "mimetype": "image/png", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:50:21.000Z", "contentLength": 1795721, "httpStatusCode": 200}', '61c4a47f-2c92-41aa-80a8-b057813bcde1', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('756d9be5-4792-4d1c-9140-17a3a9f2ead7', 'content-images', 'about-slider/1770399075078-j2xtpk.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:31:15.254371+00', '2026-02-06 17:31:15.254371+00', '2026-02-06 17:31:15.254371+00', '{"eTag": "\"38a562006ed1625c280d3a7984029a3c\"", "size": 28182, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:31:16.000Z", "contentLength": 28182, "httpStatusCode": 200}', '0fe6136c-97c9-4043-951f-76c083e31891', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('751959c8-3f7e-40fc-905f-d17d82c01ec7', 'content-images', 'INDIAMART.NS.png', NULL, '2026-02-07 20:56:00.397877+00', '2026-02-07 20:56:15.377506+00', '2026-02-07 20:56:00.397877+00', '{"eTag": "\"9aef58d6c7a292e465d6f58272604718\"", "size": 24367, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-07T20:56:16.000Z", "contentLength": 24367, "httpStatusCode": 200}', '28048d80-a6ec-4802-aa2e-84282d0695b8', NULL, NULL, 1),
	('95f8e4d6-d9cc-467a-833c-fede3a223c59', 'content-images', 'about-slider/1770399081031-f828hb.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:31:21.207187+00', '2026-02-06 17:31:21.207187+00', '2026-02-06 17:31:21.207187+00', '{"eTag": "\"9e1c9ca49b9e68c4685935674cf03247\"", "size": 20338, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:31:22.000Z", "contentLength": 20338, "httpStatusCode": 200}', 'f702894b-f879-46f5-b417-e00fec1fe31d', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('37e2e0f4-9f9f-4b2a-9bb5-9330a49e2eae', 'content-images', 'about-slider/1770399084902-jcsl8g.jpeg', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-06 17:31:25.07887+00', '2026-02-06 17:31:25.07887+00', '2026-02-06 17:31:25.07887+00', '{"eTag": "\"3a2bfeb2a057438a05b5732eff6cef9b\"", "size": 24284, "mimetype": "image/jpeg", "cacheControl": "max-age=31536000", "lastModified": "2026-02-06T17:31:26.000Z", "contentLength": 24284, "httpStatusCode": 200}', '8d82e828-8144-4b23-842e-e0854f2957ca', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 2),
	('d37920d1-bf4a-430a-980b-c8a4bf3621b7', 'content-images', '1770485430203-t42kaj.ico', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-07 17:30:30.470901+00', '2026-02-07 17:30:30.470901+00', '2026-02-07 17:30:30.470901+00', '{"eTag": "\"3f1fe81efbd4a92424fd67daf3aec143\"", "size": 32969, "mimetype": "image/vnd.microsoft.icon", "cacheControl": "max-age=31536000", "lastModified": "2026-02-07T17:30:31.000Z", "contentLength": 32969, "httpStatusCode": 200}', '013d1905-360f-46f3-bf4e-2930d9da814c', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 1),
	('d47c1742-9564-47ab-aa0c-26b3021270dc', 'product-images', 'tea-products/8894e456-d9f7-487b-bd57-9d4ac5f92e13/1770533159718.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 06:46:00.355477+00', '2026-02-08 06:46:00.355477+00', '2026-02-08 06:46:00.355477+00', '{"eTag": "\"73074b6f3e781cd903d1e9ee20f78495\"", "size": 107453, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T06:46:01.000Z", "contentLength": 107453, "httpStatusCode": 200}', '0d5e8906-0dd3-4994-add3-78baac6c5f13', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('0385780b-087d-4c3b-b036-2fc7cbf5498c', 'product-images', 'tea-products/4b9c3117-96b1-4f7a-b84a-5604e8c1fb3e/1770535598860.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 07:26:39.280338+00', '2026-02-08 07:26:39.280338+00', '2026-02-08 07:26:39.280338+00', '{"eTag": "\"6ffb73538b13a9a3d7a5e9f66667e7a1\"", "size": 95003, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T07:26:40.000Z", "contentLength": 95003, "httpStatusCode": 200}', '5e2d482f-b1e5-471e-a04c-f672f3f4da01', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('ef193c61-acdc-42c5-9644-6239fad5cedc', 'product-images', 'tea-products/639ca45a-6453-4482-8bfc-2dd22e9e1921/1770535760118.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 07:29:20.551933+00', '2026-02-08 07:29:20.551933+00', '2026-02-08 07:29:20.551933+00', '{"eTag": "\"0c69e4fe8d4a7b2ce3611242e25ff779\"", "size": 78955, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T07:29:21.000Z", "contentLength": 78955, "httpStatusCode": 200}', '2e9e1e20-cb1e-42c0-abf0-1d24e8e35b54', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('c4e94034-ca72-4a8f-88b3-a8bf196176b6', 'product-images', 'tea-products/20b12b64-d31b-4423-8461-f74fa7530ad5/1770536004182.png', '14814863-7a39-4852-b3cd-8f4395c476d8', '2026-02-08 07:33:24.53736+00', '2026-02-08 07:33:24.53736+00', '2026-02-08 07:33:24.53736+00', '{"eTag": "\"b3a885e03343104b447e4244b7b45096\"", "size": 113784, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T07:33:25.000Z", "contentLength": 113784, "httpStatusCode": 200}', '63900de4-d2ae-46f2-826b-f573fa097648', '14814863-7a39-4852-b3cd-8f4395c476d8', '{}', 3),
	('f279cdcc-73f8-4f23-beed-9016b8391f5b', 'cate_videos', 'honey.mp4', NULL, '2026-02-08 11:00:13.970393+00', '2026-02-08 11:00:13.970393+00', '2026-02-08 11:00:13.970393+00', '{"eTag": "\"57891a122b61f81cb56d0c254e4ca23d-1\"", "size": 770121, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-02-08T11:00:14.000Z", "contentLength": 770121, "httpStatusCode": 200}', 'ea6e593e-5ef5-4ed7-af2d-d383fa3c7032', NULL, NULL, 1);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('product-images', 'honey-products', '2026-01-01 17:22:28.530764+00', '2026-01-01 17:22:28.530764+00'),
	('product-images', 'tea-products', '2026-01-01 17:22:36.901624+00', '2026-01-01 17:22:36.901624+00'),
	('content-images', 'home-slider', '2026-02-06 17:08:51.206923+00', '2026-02-06 17:08:51.206923+00'),
	('content-images', 'about-slider', '2026-02-06 17:08:59.094948+00', '2026-02-06 17:08:59.094948+00'),
	('content-images', 'site-settings', '2026-02-06 17:19:49.930051+00', '2026-02-06 17:19:49.930051+00'),
	('product-images', 'tea-products/8894e456-d9f7-487b-bd57-9d4ac5f92e13', '2026-02-08 06:46:00.355477+00', '2026-02-08 06:46:00.355477+00'),
	('product-images', 'tea-products/89c357f3-fb99-4e6d-8362-f76e2f81cda1', '2026-02-08 06:50:54.047117+00', '2026-02-08 06:50:54.047117+00'),
	('product-images', 'tea-products/c8988f63-33d7-4b6a-a550-36e06e024167', '2026-02-08 06:53:01.084416+00', '2026-02-08 06:53:01.084416+00'),
	('product-images', 'tea-products/3b7ff71f-4e8c-46ff-88f6-3b722701d16d', '2026-02-08 07:04:21.359821+00', '2026-02-08 07:04:21.359821+00'),
	('product-images', 'tea-products/4b9c3117-96b1-4f7a-b84a-5604e8c1fb3e', '2026-02-08 07:26:39.280338+00', '2026-02-08 07:26:39.280338+00'),
	('product-images', 'tea-products/639ca45a-6453-4482-8bfc-2dd22e9e1921', '2026-02-08 07:29:20.551933+00', '2026-02-08 07:29:20.551933+00'),
	('product-images', 'tea-products/20b12b64-d31b-4423-8461-f74fa7530ad5', '2026-02-08 07:33:24.53736+00', '2026-02-08 07:33:24.53736+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 242, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict h1Y82ylSGnaaTgoYvSrTbNkFr4tI2P7wSojTkGVyVXuEiE5efv0xAThqQaqHHLh

RESET ALL;
