SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict fxHFwtMsPXuUwutWw2xuWMd9mUnp5P347pLJGxpMG944fhyLmo31IbzVtQucLQV

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
-- PostgreSQL database dump complete
--

-- \unrestrict fxHFwtMsPXuUwutWw2xuWMd9mUnp5P347pLJGxpMG944fhyLmo31IbzVtQucLQV

RESET ALL;
