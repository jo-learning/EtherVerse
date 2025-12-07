--
-- PostgreSQL database dump
--

\restrict 0tfrTnADXYO1Qa2MmW3QAig5ADeNrIn75xGgkCSztwezrWBACmhP1Ev6qY1IlO6

-- Dumped from database version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdminRole" AS ENUM (
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public."AdminRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    "adminId" integer NOT NULL,
    email text NOT NULL,
    "hashedPassword" text NOT NULL,
    name text,
    role public."AdminRole" DEFAULT 'ADMIN'::public."AdminRole" NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "twoFactorSecret" text,
    "resetToken" text,
    "resetTokenExpires" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- Name: AdminUserAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AdminUserAssignment" (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."AdminUserAssignment" OWNER TO postgres;

--
-- Name: FeatureFlag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FeatureFlag" (
    id text NOT NULL,
    key text NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedBy" text
);


ALTER TABLE public."FeatureFlag" OWNER TO postgres;

--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Feedback" (
    id text NOT NULL,
    "userId" text,
    message text NOT NULL,
    type text DEFAULT 'general'::text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Feedback" OWNER TO postgres;

--
-- Name: KYC; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KYC" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "Brithdate" text DEFAULT ''::text NOT NULL,
    "Place" text DEFAULT ''::text NOT NULL,
    "Email" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "certificateNumber" text,
    "certificateType" text,
    country text,
    "handHeldPath" text,
    "idBackPath" text,
    "idFrontPath" text,
    metadata jsonb,
    phone text
);


ALTER TABLE public."KYC" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settings" (
    id text NOT NULL,
    "userId" text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    "emailUpdates" boolean DEFAULT true NOT NULL,
    "twoFAEnabled" boolean DEFAULT false NOT NULL,
    notification boolean DEFAULT true NOT NULL,
    "cacheCleaned" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "walletId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "toAddress" text,
    "txHash" text
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: TransactionRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransactionRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    coin text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TransactionRecord" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "userId" integer NOT NULL,
    email text NOT NULL,
    name text,
    avatar text,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    googlefa boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserGoogleFA; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserGoogleFA" (
    id text NOT NULL,
    "userId" text NOT NULL,
    secret text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserGoogleFA" OWNER TO postgres;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "coinId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    profits double precision DEFAULT 0 NOT NULL,
    frozen double precision DEFAULT 0 NOT NULL,
    symbol text NOT NULL,
    name text NOT NULL,
    logo text,
    address text NOT NULL,
    "actualBalance" text NOT NULL,
    "privateKey" text,
    "publicKey" text NOT NULL,
    network text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO postgres;

--
-- Name: WithdrawRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WithdrawRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    coin text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."WithdrawRequest" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    who text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminId" text,
    type text DEFAULT 'text'::text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- Name: userWallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userWallet" (
    id text NOT NULL,
    "BTC" text DEFAULT '0'::text NOT NULL,
    "ETH" text DEFAULT '0'::text NOT NULL,
    "USDT" text DEFAULT '0'::text NOT NULL,
    "USDC" text DEFAULT '0'::text NOT NULL,
    "BNB" text DEFAULT '0'::text NOT NULL,
    "DAI" text DEFAULT '0'::text NOT NULL,
    "MATIC" text DEFAULT '0'::text NOT NULL,
    "XRP" text DEFAULT '0'::text NOT NULL,
    "SOL" text DEFAULT '0'::text NOT NULL,
    "ADA" text DEFAULT '0'::text NOT NULL,
    "DOGE" text DEFAULT '0'::text NOT NULL,
    "DOT" text DEFAULT '0'::text NOT NULL,
    "SHIB" text DEFAULT '0'::text NOT NULL,
    "TRX" text DEFAULT '0'::text NOT NULL,
    "LTC" text DEFAULT '0'::text NOT NULL,
    "AVAX" text DEFAULT '0'::text NOT NULL,
    "WBTC" text DEFAULT '0'::text NOT NULL,
    "LINK" text DEFAULT '0'::text NOT NULL,
    "UNI" text DEFAULT '0'::text NOT NULL,
    "BCH" text DEFAULT '0'::text NOT NULL,
    "XLM" text DEFAULT '0'::text NOT NULL,
    "VET" text DEFAULT '0'::text NOT NULL,
    "THETA" text DEFAULT '0'::text NOT NULL,
    "FIL" text DEFAULT '0'::text NOT NULL,
    "ICP" text DEFAULT '0'::text NOT NULL,
    "AAVE" text DEFAULT '0'::text NOT NULL,
    "EOS" text DEFAULT '0'::text NOT NULL,
    "XMR" text DEFAULT '0'::text NOT NULL,
    "ZEC" text DEFAULT '0'::text NOT NULL,
    "ALGO" text DEFAULT '0'::text NOT NULL,
    "ATOM" text DEFAULT '0'::text NOT NULL,
    "MKR" text DEFAULT '0'::text NOT NULL,
    "NEO" text DEFAULT '0'::text NOT NULL,
    "KSM" text DEFAULT '0'::text NOT NULL,
    "FTM" text DEFAULT '0'::text NOT NULL,
    "EGLD" text DEFAULT '0'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."userWallet" OWNER TO postgres;

--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, "adminId", email, "hashedPassword", name, role, status, "lastLoginAt", "twoFactorSecret", "resetToken", "resetTokenExpires", "createdAt", "updatedAt") FROM stdin;
b9a332d0-e732-4248-bade-4ccaf20c5e6c	1	admin@example.com	pbkdf2$sha256$120000$T5yolLoDgTnsSnF8Pg2ElQ==$+XwX2R0ZAL5RrgibFX5N1iEvTsCV3PkicKKAXVBi6J4=	Regular Admin	ADMIN	active	2025-11-24 17:10:19.946	\N	\N	\N	2025-10-04 09:08:55.233	2025-11-24 17:10:19.949
b9131c86-5526-44bc-93e0-8ad65dbbabda	2	superadmin@example.com	pbkdf2$sha256$120000$ACm6zIs6VttdXHqI6n9Hkg==$9p289E8qO2I5mckqv21rHNloa2lI/Z6/Z6D7daZNqK4=	Super Admin	SUPERADMIN	active	2025-12-01 18:29:48.183	\N	\N	\N	2025-10-04 09:08:55.34	2025-12-01 18:29:48.187
\.


--
-- Data for Name: AdminUserAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AdminUserAssignment" (id, "adminId", "userId", "createdAt", active) FROM stdin;
137132a9-bd4f-44b1-9a62-2d61a1d22f78	b9a332d0-e732-4248-bade-4ccaf20c5e6c	c9f5754b-011a-4e17-8700-1ee952231774	2025-11-07 20:58:20.258	f
d41be06c-e8db-4e3a-b3a1-ae1e159db584	b9a332d0-e732-4248-bade-4ccaf20c5e6c	c9f5754b-011a-4e17-8700-1ee952231774	2025-11-08 10:06:31.98	t
\.


--
-- Data for Name: FeatureFlag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureFlag" (id, key, enabled, "updatedAt", "updatedBy") FROM stdin;
c8deeb34-a837-4c60-96c4-b92878d260a9	trade-profit	t	2025-12-05 02:36:55.643	b9131c86-5526-44bc-93e0-8ad65dbbabda
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Feedback" (id, "userId", message, type, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: KYC; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KYC" (id, "userId", "firstName", "lastName", "Brithdate", "Place", "Email", status, "submittedAt", "verifiedAt", "certificateNumber", "certificateType", country, "handHeldPath", "idBackPath", "idFrontPath", metadata, phone) FROM stdin;
583eb72f-e66e-496e-a817-c745b695d98f	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	Jonathan	Smith		United States	0x5E7C37f2724FcA2357F5f790d648F44e204Ae660	pending	2025-11-18 22:23:18.681	\N	34583835	Driver's License	United States	/uploads/kyc/4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45/hand-held-1763504598677.png	/uploads/kyc/4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45/id-back-1763504598674.png	/uploads/kyc/4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45/id-front-1763504598672.png	\N	+12133456798
dd1993cf-d0e5-47a2-bcdc-7eb765c95376	20eec765-82bc-4f35-ade1-b984fc38f62b	Rhehr	Rheegw		United States	0xA0913942fAb5df8F94f48D4D85D7b1401C19E865	approved	2025-11-18 21:34:47.055	2025-11-18 21:36:50.704	37473474	Passport	United States	/uploads/kyc/20eec765-82bc-4f35-ade1-b984fc38f62b/hand-held-1763501687051.jpeg	/uploads/kyc/20eec765-82bc-4f35-ade1-b984fc38f62b/id-back-1763501687049.jpeg	/uploads/kyc/20eec765-82bc-4f35-ade1-b984fc38f62b/id-front-1763501687045.png	\N	+12394474743
7f9b979a-a2be-449d-83f0-8f9068d2f9c3	fbbea3bc-fcd8-4679-b786-546891bd76ba	Lulex	Daphne		United States	0xE8436c97A37251a5e29070fCfbc94B6316AEca98	approved	2025-11-19 16:56:35.059	2025-11-19 16:59:47.594	49034312	Driver's License	United States	/uploads/kyc/fbbea3bc-fcd8-4679-b786-546891bd76ba/hand-held-1763571395056.jpeg	/uploads/kyc/fbbea3bc-fcd8-4679-b786-546891bd76ba/id-back-1763571395054.png	/uploads/kyc/fbbea3bc-fcd8-4679-b786-546891bd76ba/id-front-1763571395051.png	\N	+12347652408
7be2105b-9b40-476a-b16a-4b17c26dee4a	7910c49f-2d35-4763-a480-81a5164137db	Dhdbdv	Chrbdb		United States	0x83aD492373a99c72362C96Be824cC9C980D3924D	approved	2025-11-18 20:42:38.121	2025-11-18 20:45:06.199	24853722	Passport	United States	/uploads/kyc/7910c49f-2d35-4763-a480-81a5164137db/hand-held-1763498558116.png	/uploads/kyc/7910c49f-2d35-4763-a480-81a5164137db/id-back-1763498558114.png	/uploads/kyc/7910c49f-2d35-4763-a480-81a5164137db/id-front-1763498558109.png	\N	+12435945545
62f71f0d-2127-489e-8cc7-136ba3f8dfdc	3b2f8478-aa2d-4729-b5e3-ef19868625e6	sdfgds	sfdgfsdgsdf		Canada	0x56B3A20df114Cf4f9594C38Ff15f140bce6172e7	pending	2025-11-18 23:01:12.94	\N	sdfgsfdg	National ID	Canada	/uploads/kyc/3b2f8478-aa2d-4729-b5e3-ef19868625e6/hand-held-1763506872933.png	/uploads/kyc/3b2f8478-aa2d-4729-b5e3-ef19868625e6/id-back-1763506872931.png	/uploads/kyc/3b2f8478-aa2d-4729-b5e3-ef19868625e6/id-front-1763506872929.png	\N	sfdgsdfg
c0067929-25e5-423d-8644-7269daeda7b0	2810e7b7-68ca-42d3-a251-7b2b4a5b93c1	Shege	Dbdbd		United States	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	approved	2025-11-18 21:28:15.501	2025-11-18 21:29:53.463		Passport	United States	/uploads/kyc/2810e7b7-68ca-42d3-a251-7b2b4a5b93c1/hand-held-1763501295497.png	/uploads/kyc/2810e7b7-68ca-42d3-a251-7b2b4a5b93c1/id-back-1763501295496.png	/uploads/kyc/2810e7b7-68ca-42d3-a251-7b2b4a5b93c1/id-front-1763501295495.jpeg	\N	3843832
f6ab9b7c-8617-4260-87ec-2c5556742c83	90b7f7e8-8110-457c-8b4e-f92229371b08	Deadl	Dmskzf		United States	0x4b63b2a2B0Ea0cfA1e8Fa07A5b978104d4b86639	approved	2025-11-18 21:41:22.385	2025-11-18 21:43:13.289	3583928	Driver's License	United States	/uploads/kyc/90b7f7e8-8110-457c-8b4e-f92229371b08/hand-held-1763502082382.png	/uploads/kyc/90b7f7e8-8110-457c-8b4e-f92229371b08/id-back-1763502082381.png	/uploads/kyc/90b7f7e8-8110-457c-8b4e-f92229371b08/id-front-1763502082378.jpeg	\N	+12134567687
64fd38b2-16a3-4e4e-8973-bd80867a3a3c	3d83f94e-3e00-49f5-a5e8-a86006ba2b95	Qwerty	Dfghjj		United Kingdom	0xE4b36553FC820789E8DB85AbD43F9517B3eba732	rejected	2025-11-18 21:28:00.665	\N	Werd c	National ID	United Kingdom	/uploads/kyc/3d83f94e-3e00-49f5-a5e8-a86006ba2b95/hand-held-1763501280657.jpg	/uploads/kyc/3d83f94e-3e00-49f5-a5e8-a86006ba2b95/id-back-1763501280654.png	/uploads/kyc/3d83f94e-3e00-49f5-a5e8-a86006ba2b95/id-front-1763501280652.jpg	\N	985885668896
f34f3e57-5da4-433b-8e73-1fdf0bcbcce4	5049ab9e-1641-4561-9c08-c0c18b8ec6cf	Djdks	Dsksk		United States	0xAEf11F45d2AE1e791234cfE7B2faF3CC83614Ccf	approved	2025-11-18 21:44:03.113	2025-11-18 21:49:00.866	342849292	Driver's License	United States	/uploads/kyc/5049ab9e-1641-4561-9c08-c0c18b8ec6cf/hand-held-1763502243110.png	/uploads/kyc/5049ab9e-1641-4561-9c08-c0c18b8ec6cf/id-back-1763502243107.png	/uploads/kyc/5049ab9e-1641-4561-9c08-c0c18b8ec6cf/id-front-1763502243104.png	\N	+12134563757
7ac053de-7b2f-4f8e-8511-f026443f8108	d79667c7-b207-4b61-aee4-97d5ef32b361	Filmon	Habteab		Canada	0xdfEC3Cc261b53Dd1C2E4769C374403335B0b7e67	approved	2025-11-19 16:23:57.477	2025-11-19 16:36:25.771	123456	National ID	Canada	/uploads/kyc/d79667c7-b207-4b61-aee4-97d5ef32b361/hand-held-1763569437473.jpeg	/uploads/kyc/d79667c7-b207-4b61-aee4-97d5ef32b361/id-back-1763569437472.png	/uploads/kyc/d79667c7-b207-4b61-aee4-97d5ef32b361/id-front-1763569437469.png	\N	0901980695
c5c4ba6c-27f0-4bd8-9dc7-f275f952fce4	0274d8bc-5f5c-4ff4-9296-0d49440206c1	Lulex	Daphne		United States	0xccAB437773e13Cd080f98221a19c418604d1990b	approved	2025-11-19 17:40:52.459	2025-11-19 17:44:06.338	3464219	Driver's License	United States	/uploads/kyc/0274d8bc-5f5c-4ff4-9296-0d49440206c1/hand-held-1763574052455.jpeg	/uploads/kyc/0274d8bc-5f5c-4ff4-9296-0d49440206c1/id-back-1763574052450.png	/uploads/kyc/0274d8bc-5f5c-4ff4-9296-0d49440206c1/id-front-1763574052446.jpeg	\N	+12457694053
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", message, read, "createdAt") FROM stdin;
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (id, "userId", language, "emailUpdates", "twoFAEnabled", notification, "cacheCleaned") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, "userId", "walletId", type, amount, status, "createdAt", "updatedAt", "toAddress", "txHash") FROM stdin;
\.


--
-- Data for Name: TransactionRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransactionRecord" (id, "userId", type, coin, amount, status, "createdAt", "updatedAt") FROM stdin;
dcb2c86f-5d1b-4c72-ad85-6d29275ed801	631f6542-18b8-49e8-a5a1-ca1b1d2cd430	topup	USDT	3000000	completed	2025-11-28 16:01:53.014	2025-11-28 16:01:53.014
7a5d2fea-15ee-4d37-80ba-c9a0aedda06f	c9f5754b-011a-4e17-8700-1ee952231774	topup	USDT	45000	completed	2025-11-28 16:58:28.873	2025-11-28 16:58:28.873
0606221d-fbb2-47ce-8625-98e096e8acca	7af63790-6975-40e2-a77f-3e1ade9509ea	topup	USDT	70000	completed	2025-11-28 19:23:43.236	2025-11-28 19:23:43.236
6882f399-30e4-4bb4-8a19-41d35120456e	1a7061df-2b7c-40ee-8f38-561d27aa2437	topup	USDT	1194	completed	2025-11-29 02:14:35.605	2025-11-29 02:14:35.605
0f9b2cc3-c8fa-436e-aa3c-cb10a12fa0b3	1a7061df-2b7c-40ee-8f38-561d27aa2437	topup	USDT	1194	completed	2025-11-29 02:14:35.637	2025-11-29 02:14:35.637
19cad349-6847-4005-830c-dfb045223d64	1a7061df-2b7c-40ee-8f38-561d27aa2437	withdrawal	USDT	1194	completed	2025-11-29 07:27:04.247	2025-11-29 07:27:04.247
80863b6a-896a-4256-ac7f-7749633f3252	8760c03e-619c-448a-b107-a8707cf01401	topup	USDT	50000	completed	2025-11-29 14:45:49.425	2025-11-29 14:45:49.425
a9a4a174-d5ff-437d-b6b2-bf1ff9fe5521	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	topup	USDT	50162.24	completed	2025-11-30 03:57:32.884	2025-11-30 03:57:32.884
d37361aa-ba7f-42c4-b7de-6576f0aa9db5	25529bdf-6ff6-4b2e-a7a3-424884df315a	topup	USDT	50000	completed	2025-11-30 18:56:43.491	2025-11-30 18:56:43.491
c4c639d6-f75d-42dd-8beb-e002d2be1bc6	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	topup	USDT	50000	completed	2025-12-01 04:39:48.938	2025-12-01 04:39:48.938
d4e8e4b3-c155-4484-a5ee-2964760e7f96	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	topup	USDT	21500	completed	2025-12-01 21:53:10.333	2025-12-01 21:53:10.333
15574f12-8996-451c-8cf0-c52a4992c7dd	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	withdrawal	USDT	50000	completed	2025-12-02 04:44:36.3	2025-12-02 04:44:36.3
01ecc43b-13b7-4b97-b296-db3fb6c5a735	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	withdrawal	USDT	21500	completed	2025-12-02 23:55:52.366	2025-12-02 23:55:52.366
e3574f91-0df7-4d0c-8e8e-b5391779d364	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	topup	USDT	500000	completed	2025-12-05 02:40:43.038	2025-12-05 02:40:43.038
97d49677-45ec-4ab1-b9ec-f737f646172f	8760c03e-619c-448a-b107-a8707cf01401	topup	BTC	10	completed	2025-12-05 02:45:21.551	2025-12-05 02:45:21.551
1d09f55f-a41b-4554-8881-e368a256a8a2	8760c03e-619c-448a-b107-a8707cf01401	topup	BTC	100	completed	2025-12-05 02:48:20.939	2025-12-05 02:48:20.939
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "userId", email, name, avatar, status, "createdAt", "updatedAt", googlefa) FROM stdin;
20eec765-82bc-4f35-ade1-b984fc38f62b	13547010	0xA0913942fAb5df8F94f48D4D85D7b1401C19E865	\N	\N	active	2025-11-18 05:43:19.836	2025-11-18 05:43:19.836	f
5049ab9e-1641-4561-9c08-c0c18b8ec6cf	79884396	0xAEf11F45d2AE1e791234cfE7B2faF3CC83614Ccf	\N	\N	active	2025-11-18 20:50:50.921	2025-11-18 20:50:50.921	f
3d83f94e-3e00-49f5-a5e8-a86006ba2b95	52490033	0xE4b36553FC820789E8DB85AbD43F9517B3eba732	\N	\N	active	2025-11-18 21:21:59.823	2025-11-18 21:21:59.823	f
a34097fd-2174-4d58-a35f-122dfddde6b7	94169003	0xe37b25e6dD271fBD79CD9b5D41beD23aAEA6eE78	\N	\N	active	2025-11-18 21:22:56.283	2025-11-18 21:22:56.283	f
2810e7b7-68ca-42d3-a251-7b2b4a5b93c1	38834501	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	\N	\N	active	2025-11-18 21:27:20.767	2025-11-18 21:27:20.767	f
90b7f7e8-8110-457c-8b4e-f92229371b08	21809020	0x4b63b2a2B0Ea0cfA1e8Fa07A5b978104d4b86639	\N	\N	active	2025-11-18 21:39:38.258	2025-11-18 21:39:38.258	f
3b2f8478-aa2d-4729-b5e3-ef19868625e6	31586315	0x56B3A20df114Cf4f9594C38Ff15f140bce6172e7	\N	\N	active	2025-11-18 22:59:37.465	2025-11-18 22:59:37.465	f
e3f26521-0a70-4ca3-b6f1-c76404d217a4	77855958	0xF75da2E256950FAa63a898320379F8f66d746be8	\N	\N	active	2025-11-19 04:33:54.706	2025-11-19 04:33:54.706	f
fbbea3bc-fcd8-4679-b786-546891bd76ba	5382852	0xE8436c97A37251a5e29070fCfbc94B6316AEca98	\N	\N	active	2025-11-19 11:24:44.049	2025-11-19 11:24:44.049	f
0274d8bc-5f5c-4ff4-9296-0d49440206c1	21942205	0xccAB437773e13Cd080f98221a19c418604d1990b	\N	\N	active	2025-11-19 17:39:14.571	2025-11-19 17:39:14.571	f
0eed9d63-5642-4326-b7d5-b737ebfca35c	25212049	0xB74Db8eB4aebCa066614E0F425d125fe6CAd131f	\N	\N	active	2025-11-30 18:42:38.772	2025-11-30 18:42:38.772	f
4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	8832344	0x5E7C37f2724FcA2357F5f790d648F44e204Ae660	\N	\N	active	2025-11-18 05:35:36.391	2025-11-20 17:45:41.788	t
68eaa7a2-4b40-4f39-bc29-617c6166a6fd	49413440	0x7458c3EF2F3B7f82f0257759E9b8bfFDb47e3175	\N	\N	active	2025-11-20 22:01:39.505	2025-11-20 22:01:39.505	f
d79667c7-b207-4b61-aee4-97d5ef32b361	93732720	0xdfEC3Cc261b53Dd1C2E4769C374403335B0b7e67	\N	\N	active	2025-11-19 16:18:18.803	2025-11-21 19:48:49.17	t
ebfc4f31-fad6-4de3-a1a5-be0b9437d712	90730046	0xd637930843Cf32d7695443A601999553D03E9778	\N	\N	active	2025-11-23 05:41:46.212	2025-11-23 05:41:46.212	f
c584b06e-7827-41bb-8803-4c04067154ff	54290496	0x034e4c11632B63e5e5f3e0932dFB0Ee9971CA12A	\N	\N	active	2025-11-30 18:42:56.081	2025-11-30 18:42:56.081	f
f8f2d114-f033-4dd2-b02a-7e1d0766b2a4	65705319	0x680572128EB7922230Bb72b77d9e6Ffe97344a6b	\N	\N	active	2025-12-05 02:55:45.169	2025-12-05 02:55:45.169	f
ce772766-1350-4e91-979e-ab8e6445f559	68179508	0x8aE3767d07B8c2884C6732cFfad019467D5AdF9E	\N	\N	active	2025-12-05 04:44:23.259	2025-12-05 04:44:23.259	f
86690e17-3c3e-423d-9072-e11c91caf92b	95209333	0xC132c75F16cdC6Def508e07C6b3Cd42BE12cfd2D	\N	\N	active	2025-12-05 05:43:37.699	2025-12-05 05:43:37.699	f
641f82ed-b211-4471-bdbe-33a8939c3c97	75770176	0x314bA8063d0aFC6CD29932725C8D2F4A0175E7C0	\N	\N	active	2025-11-23 19:14:05.349	2025-11-23 19:14:05.349	f
c9f5754b-011a-4e17-8700-1ee952231774	54726497	0xb950A3B3F1f756b2d48aF160C8486a62F2d7E9a8	\N	\N	active	2025-11-07 20:06:23.401	2025-11-23 22:56:08.485	t
7910c49f-2d35-4763-a480-81a5164137db	94399133	0x83aD492373a99c72362C96Be824cC9C980D3924D	\N	\N	active	2025-11-18 20:21:41.475	2025-11-25 21:44:22.82	t
631f6542-18b8-49e8-a5a1-ca1b1d2cd430	96049277	0x2F8cf11BB19A2C374D29E0a9378Fe6E5af53c8B4	\N	\N	active	2025-11-28 11:40:32.324	2025-11-28 11:40:32.324	f
7af63790-6975-40e2-a77f-3e1ade9509ea	96693409	0xCD7742974FEA2f90858Aaeb954e4928B61B82557	\N	\N	active	2025-11-28 15:18:42.721	2025-11-28 15:18:42.721	f
1a7061df-2b7c-40ee-8f38-561d27aa2437	2483054	0x8a002A8FcF7cfDc7247451a5D292016DFeAedB49	\N	\N	active	2025-11-28 22:21:11.251	2025-11-28 22:21:11.251	f
25529bdf-6ff6-4b2e-a7a3-424884df315a	67925231	0x1A944386421dC90d0c179a7a0Fe7450D701fdF02	\N	\N	active	2025-11-29 07:30:07.253	2025-11-29 07:30:07.253	f
8760c03e-619c-448a-b107-a8707cf01401	54332718	0xDd030d3e7c21d608CfBe80EAe6eB54c56Db21E71	\N	\N	active	2025-11-29 14:41:26.444	2025-11-29 14:41:26.444	f
3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	96100049	0x8A65DDd4283ba9C492FaE1cdE6e0218F1d034E18	\N	\N	active	2025-11-30 03:42:58.756	2025-11-30 04:20:37.144	t
bbed72e6-5f71-4a8b-89cc-b9c05c1e90b2	24770130	0xb4B546c4d2FFd83c787981aD92F748bEAe796A60	\N	\N	active	2025-11-18 00:44:25.002	2025-11-18 00:44:25.002	f
63ced099-38b2-4384-a3ff-45037ac8bb71	14177014	0x65720Aa2959D745a2a24bC779f05100A0217d905	\N	\N	active	2025-11-30 18:42:37.798	2025-11-30 18:42:37.798	f
\.


--
-- Data for Name: UserGoogleFA; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserGoogleFA" (id, "userId", secret, verified, "verifiedAt", "createdAt", "updatedAt") FROM stdin;
90954bdd-19b0-4d08-b93c-23468a4e76d8	0274d8bc-5f5c-4ff4-9296-0d49440206c1	OFBEIWBSK5ZDQVJGIVKFQ33SJISDWVRR	f	\N	2025-11-20 10:16:31.223	2025-11-20 10:18:40.37
f16c94fd-023d-486e-b377-21aedb442bb5	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	MNPCGKDLORTDC5CBNM5CCPTGKZNUSLZX	t	2025-11-20 17:45:41.784	2025-11-20 17:44:58.301	2025-11-20 17:45:41.788
ae4b8044-8523-46c0-abed-f8cd3679c5a4	d79667c7-b207-4b61-aee4-97d5ef32b361	KZETKJDBMRRXEJDCMZRTYN2LK5JEWMKH	t	2025-11-21 19:48:49.167	2025-11-21 19:48:10.976	2025-11-21 19:48:49.17
6d3515c9-f649-49b9-9536-336eeb842400	7910c49f-2d35-4763-a480-81a5164137db	KERWWTLWKJCEW63IIN5EU4RSOZFESOC3	t	2025-11-23 17:27:22.035	2025-11-23 17:08:49.582	2025-11-23 17:27:22.036
c36cf1e2-c588-404c-9398-1bd7ee79c053	c9f5754b-011a-4e17-8700-1ee952231774	LVVUKWTZMZ6SCMRXPMUWOSLYJRHSUPDL	t	2025-11-23 22:56:08.483	2025-11-23 22:55:06.222	2025-11-23 22:56:08.485
60e0cf53-b8a8-47ca-879f-32c81041cedb	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	K5STKMSVH5RHEYRBJVCEUKK2IZ4HE5JR	t	2025-11-30 04:20:37.142	2025-11-30 04:04:14.356	2025-11-30 04:20:37.144
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wallet" (id, "coinId", balance, profits, frozen, symbol, name, logo, address, "actualBalance", "privateKey", "publicKey", network, "createdAt", "updatedAt") FROM stdin;
691c9739-5ec4-4d22-8f24-a79dcdbf48cf	AAVE	0	0	0	AAVE	AAVE Wallet	https://assets.coingecko.com/coins/images/12645/large/AAVE.png		0	\N			2025-10-04 09:06:04.88	2025-10-04 09:08:06.228
d34bab6a-d403-4a79-93bc-941437399df8	ADA	0	0	0	ADA	ADA Wallet	https://assets.coingecko.com/coins/images/975/large/cardano.png		0	\N			2025-10-04 09:06:04.883	2025-10-04 09:08:06.231
3b33ce38-2a09-4508-bc7e-3752412d3f12	BTC	0	0	0	BTC	BTC Wallet	https://assets.coingecko.com/coins/images/1/large/bitcoin.png	bc1qllsxmsr298gj7eecjr764ugkzt234uqt8f8fp6	0	\N	not assigned	BTC	2025-10-04 09:06:04.858	2025-11-05 09:42:16.824
62f4fd02-db95-4c5c-a5a3-a9c9b88589da	ETH	0	0	0	ETH	ETH Wallet	https://assets.coingecko.com/coins/images/279/large/ethereum.png	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	0	\N	not Assigned	ETH	2025-10-04 09:06:04.865	2025-11-05 09:42:48.739
d3924696-8a78-4a59-a895-43469864d70e	BNB	0	0	0	BNB	BNB Wallet	https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	0	\N	not Assigned	BNB	2025-10-04 09:06:04.872	2025-11-05 09:43:25.477
d3530ebe-7ab7-4c4f-a3ab-5e3c8ca741f3	USDT	0	0	0	USDT	USDT Wallet	https://assets.coingecko.com/coins/images/325/large/Tether.png	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	0	\N	to be assign	USDT	2025-10-04 09:06:04.869	2025-11-05 09:43:46.24
592d6708-b9fd-4a6d-a4ed-ef165af8ae3a	XRP	0	0	0	XRP	XRP Wallet	https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png	rNnRssumVBoqcLHPf1EntcCBPZe9fDtz4p	0	\N	not Assigned	XRP	2025-10-04 09:06:04.874	2025-11-05 09:44:22.304
a6d6e7f2-895a-466a-a7a5-3a78aeccf04d	DOGE	0	0	0	DOGE	DOGE Wallet	\N	D5ALwfcqimW7ys3ANQvXS7YrJDAWe8uPte	0	\N	not Assigned	DOGE	2025-11-05 09:47:46.4	2025-11-05 09:47:46.4
e053c872-f524-4d86-8210-b8e491e510a8	ETC	0	0	0	ETC	ETC Wallet	\N	0x9BFc456fA4019A30671fe532394197c6c2493D6A	0	\N	not Assigned	ETC	2025-11-05 09:55:29.469	2025-11-05 09:55:29.469
e89efdb7-f73a-4033-930b-ee9c22daf52c	ZEC	0	0	0	ZEC	ZEC Wallet	\N	t1PbdaQ3QckwFFDPerpGajb6Z3C2wKnK6i1	0	\N	not Assigned	ZEC	2025-11-05 09:56:09.634	2025-11-05 09:56:09.634
5debafb9-1d9c-412c-b905-e2b7d4c696b7	BCH	0	0	0	BCH	BCH Wallet	\N	qpj95zlf39smypje9dfzaduldtdtgp4seg96d207s9	0	\N	not Assigned	BCH	2025-11-05 09:56:45.426	2025-11-05 09:56:45.426
96b11be9-f907-403d-a95f-97f2ba73b14b	USDC	0	0	0	USDC	USDC Wallet	\N	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	0	\N	not Assigned	USDC	2025-11-05 09:57:18.35	2025-11-05 09:57:18.35
5d18b47c-8473-4e83-aace-4f3d2f5269ce	TWT	0	0	0	TWT	TWT Wallet	\N	0x10EbE0c317bdfB3aBE45BFb50160Fe89eA310F87	0	\N	not Assigned	TWT	2025-11-05 09:58:01.15	2025-11-05 09:58:01.15
a7c9a5b8-6edd-4dd3-9f01-06dbe6be1e2e	SOL	0	0	0	SOL	SOL Wallet	https://assets.coingecko.com/coins/images/4128/large/solana.png	DCxi1mz7pchDWR91Gkj7gWVdk3y5QNfmjFD9GseGvjyu	0	\N	not Assigned	SOL	2025-10-04 09:06:04.877	2025-11-05 09:58:25.532
\.


--
-- Data for Name: WithdrawRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WithdrawRequest" (id, "userId", coin, amount, status, "createdAt", "updatedAt", address) FROM stdin;
d8f7236c-1977-42b7-b28b-0cf4be9725e0	c9f5754b-011a-4e17-8700-1ee952231774	USDT	25000	pending	2025-11-25 04:56:36.917	2025-11-25 04:56:36.917	0xcb5fc05ca8152bc443b43f6960b2a4ea69ef8d62
f1c9110b-5a94-40fc-b938-9a04eae9213b	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	USDT	1000	pending	2025-11-30 13:10:08.989	2025-11-30 13:10:08.989	0x8A65DDd4283ba9C492FaE1cdE6e0218F1d034E18
71d8acd6-c5a6-4eb6-8841-69563677abbc	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	USDT	1000	pending	2025-11-30 13:11:12.845	2025-11-30 13:11:12.845	0x8A65DDd4283ba9C492FaE1cdE6e0218F1d034E18
0f9a8e73-162d-4077-86d6-85aac20d1ab3	c9f5754b-011a-4e17-8700-1ee952231774	USDT	1000	pending	2025-12-01 23:50:24.161	2025-12-01 23:50:24.161	rNnRssumVBoqcLHPf1EntcCBPZe9fDtz4p
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0509a7b0-6e2c-4221-8b8a-51d450e5ac0b	3c6974c3ae6684990fce30141a6d64de672fcb2a7a055d1af654c6350e326480	2025-10-04 08:59:01.480996+00	20250921133031_new_update_to_the_database	\N	\N	2025-10-04 08:59:01.416538+00	1
dcf1d3bf-a778-49ee-9767-5a49533017dc	57eeac7b8f57a509dd056c720a0e887019c1c15f15de7ea7383cd77fe6dd8986	2025-11-24 21:14:21.519108+00	20251124205328_add_address	\N	\N	2025-11-24 21:14:21.515094+00	1
7a1200a9-5a06-432e-a11e-fbb130cb6c2d	fecd90bd122b9b32bce99a0918477abb14511430128383d11694ad5d10f256d5	2025-10-04 08:59:01.496165+00	20250921135129_adding_new_model_called_user_wallet	\N	\N	2025-10-04 08:59:01.48261+00	1
1c046a40-cf96-4c9f-889f-b6da162a93fc	0d0cac7e5976f1132fd456363105b8a6a697a69e8ec10fae0fa6115b7dd0328c	2025-10-04 08:59:01.506272+00	20250921135325_add_user_id_at_the_user_wallet	\N	\N	2025-10-04 08:59:01.497427+00	1
d07b2d68-99e0-40fd-ac86-14afb19d6d94	bcdb1c257dbe48e163c2fbd195e47aa18ace032e6a6c1ec6d9fc74896362ae35	2025-10-04 08:59:01.520701+00	20250923094631_add_admin_to_the_schema	\N	\N	2025-10-04 08:59:01.507441+00	1
33d08c17-3b2e-4a53-91ec-97398254f1de	e89427b5826ef1b5674116558d553ff813fdfce855e3d621e293d24020d19dc9	2025-11-28 13:37:00.582499+00	20251128121349_added_transaction_record	\N	\N	2025-11-28 13:37:00.547314+00	1
77f8e281-be13-4a0a-b2e4-a1b5eb0c5d37	faa1f12209828c20fa51774fc836f0def1e77d65c79a832cb5ab046c0f2e481a	2025-10-04 08:59:01.536734+00	20250925085639_assignement_added_user	\N	\N	2025-10-04 08:59:01.521855+00	1
579369cf-1149-4db4-bd43-6c8d5cdc8f47	114340b05e7e681aaf72b5d5ea9d74d6c61106dde3bf63936c087932608ff632	2025-10-10 20:19:24.544719+00	20251009130922_extend_kyc	\N	\N	2025-10-10 20:19:24.536278+00	1
8ca06412-188f-47a2-bb8a-38f860e1b30a	d2cf22f52c4d831563771ef7643a312e9efde73304f82cc1ee868ea76f0046ca	2025-10-10 20:19:24.557148+00	20251009212443_add_feature_flag_model	\N	\N	2025-10-10 20:19:24.54591+00	1
51595ed2-8384-4d3b-9cff-c82889be6ede	07badc52f0a130eda9edc0e15b315eeadc3cc2ba78373e1e0f59ae06715f779d	2025-12-04 18:30:52.071013+00	20251204175748_add_is_read_to_chat	\N	\N	2025-12-04 18:30:52.060061+00	1
9a1cb864-5cc1-4585-a46b-124c79abe284	41a2647da356b3c4d279d505bbeb4bfbd6933be424f02d8d4885e76270d4c3a0	2025-11-20 09:34:50.251804+00	20251114050134_add	\N	\N	2025-11-20 09:34:50.233319+00	1
c5bdb883-39d6-42ac-9a7a-333c92ca69d1	d115a9fc98fde4d94bb7988785dd2c51e252a116f5199cb3a8f837f0486c0a54	2025-11-20 09:34:50.278405+00	20251119100000_google_2fa	\N	\N	2025-11-20 09:34:50.254025+00	1
9b8c57bf-30dd-40f5-ac3e-56d789b24e66	22a6019a3d651fce9fd4059bfbf66b28a0a98b8fe482293014876e1d88e30eaa	2025-11-20 09:34:50.286402+00	20251119212542_google_2fa	\N	\N	2025-11-20 09:34:50.280307+00	1
51e61a3e-7928-4c7d-b33f-7828c3f6d9aa	240040fabb18f0a61ff365034ca03f61d1d63fde60587d96ae563f90e81f2f71	2025-11-22 08:39:35.075996+00	20251122075312_added_type_to_chat	\N	\N	2025-11-22 08:39:35.064778+00	1
0b8700e6-4fb6-436b-aba1-60b8251df310	4a57a4105449f4b92c24177d09853217fedb9b68f8899f87c48d12e2b18a28fb	2025-11-24 21:14:21.500307+00	20251124173601_add_feedback_model	\N	\N	2025-11-24 21:14:21.483622+00	1
fe3911e0-d19e-463f-a048-e49bb6a2192d	a17d60d922fd14f9990788ae43793c61fb255cf612a7fd0615d6484d41b715a0	2025-11-24 21:14:21.513581+00	20251124174724_add_withdraw_request_model	\N	\N	2025-11-24 21:14:21.501369+00	1
\.


--
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat (id, "userId", message, who, "createdAt", "adminId", type, "isRead") FROM stdin;
6e66746c-3013-445e-9158-dd5603dab864	ce772766-1350-4e91-979e-ab8e6445f559	Dgdcg	user	2025-12-05 04:47:38.912	\N	text	t
cadf4edf-3d86-47a4-b84d-5254157b6f4a	7910c49f-2d35-4763-a480-81a5164137db	Dear 	user	2025-11-23 22:50:59.354	\N	text	t
4dc01eb0-0317-48a4-94ea-ac26e67a46a8	c9f5754b-011a-4e17-8700-1ee952231774	Thank you for providing your UID. I’ve reviewed your account details from the Derlv platform, and I can confirm the following balances: Available: 158,439.834 USDT Frozen: 1,000 USDT Pending: 20,000 USDT Please confirm if you’d like all funds combined into one total balance before transfer, or if you prefer to keep them in their current categories. Once I have your confirmation, I’ll proceed with the next step right away.	admin	2025-11-07 20:56:05.498	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
6af280b4-4769-4176-ac57-a7f189ae828c	c9f5754b-011a-4e17-8700-1ee952231774	Yes please 	user	2025-11-08 00:23:21.735	\N	text	t
47e1c67f-fcd7-4205-9a43-0b1a4d723924	c9f5754b-011a-4e17-8700-1ee952231774	Yes please combine together thank you 	user	2025-11-08 00:24:16.53	\N	text	t
80a64534-fa7e-471e-96b7-a54ed5f06209	c9f5754b-011a-4e17-8700-1ee952231774	Thank you for confirming, All your funds will be combined and transferred to your USDT wallet. The total combined amount is 179,439.834 USDT. We’ll proceed with the process and notify you once the transfer is fully completed. If you have any further questions, please don’t hesitate to reach out. Thank you for your cooperation and trust	admin	2025-11-08 06:46:38.361	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
5b477f47-61a2-41cd-b8bf-fdc6b6e2e5d5	c9f5754b-011a-4e17-8700-1ee952231774	How do I send tether to XRP in this platform 	user	2025-11-09 04:48:02.271	\N	text	t
12a7fc73-4178-454f-8590-45a2226d0000	7910c49f-2d35-4763-a480-81a5164137db	Dhfhd	user	2025-11-23 16:51:17.555	\N	text	t
fcce50d9-a2dd-472d-a3f6-07d0ef4712db	7910c49f-2d35-4763-a480-81a5164137db	/uploads/chat/IMG_1735-1763917051451-797053469.png	user	2025-11-23 16:57:31.725	\N	image	t
fa29b746-3fa1-41f6-902d-df1de5a9d04f	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	Hi	user	2025-11-23 21:59:20.756	\N	text	t
64f2296d-d635-429b-8ae1-a08ede3d4cf4	7910c49f-2d35-4763-a480-81a5164137db	Who is this 	admin	2025-11-23 22:51:37.729	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
a7297701-430c-4a53-81ba-eceb2ac4688d	7910c49f-2d35-4763-a480-81a5164137db	/uploads/chat/IMG_1740-1763938360024-722975865.png	user	2025-11-23 22:52:40.301	\N	image	t
b9a3f83b-8996-4878-8efe-8cc43c4701ab	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	Hu	user	2025-11-23 16:26:01.833	\N	text	t
659d828e-83a0-4ffa-8595-576692cd9a1b	c9f5754b-011a-4e17-8700-1ee952231774	My UID # 90816349 from the Derlv platform 	user	2025-11-07 20:47:10.246	\N	text	t
7e286dde-d07a-439c-86bb-2b909d44c03c	7af63790-6975-40e2-a77f-3e1ade9509ea	Ale bro	user	2025-12-05 04:49:32.626	\N	text	t
b9edcbe4-26fd-4f4e-8c16-1a807f17d85b	d79667c7-b207-4b61-aee4-97d5ef32b361	How can help u?	admin	2025-11-23 04:24:53.063	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
c1d51be7-3954-457f-ba06-1ebe87e57a12	c9f5754b-011a-4e17-8700-1ee952231774	I would like to close my account Keith.stancill@yahoo.com	user	2025-11-23 13:14:00.939	\N	text	t
0bbba9ca-9425-4b6e-8a68-50aed1f146ba	d79667c7-b207-4b61-aee4-97d5ef32b361	How can I help u?	admin	2025-11-23 04:24:16.494	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
3a8358f2-b91c-4368-9308-7bd8b12bad59	0274d8bc-5f5c-4ff4-9296-0d49440206c1	Djee	admin	2025-11-23 03:28:19.901	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
8a1b625f-9f82-4f95-bedb-bbdef0cb0d0f	0274d8bc-5f5c-4ff4-9296-0d49440206c1	Dhdbed	admin	2025-11-23 03:27:54.432	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
3f692f82-7d85-47be-917f-17a903039b21	e3f26521-0a70-4ca3-b6f1-c76404d217a4	Welcome, Mr. Ashton.\nThank you for transferring your trading account to us. We are pleased to inform you that your request has been successfully processed. You can now view your account balance on our platform, as well as access all available features, including trading, withdrawals, and funding your account.\nIf you have any questions or require assistance at any point, please feel free to contact our support team. We’re here to help	admin	2025-11-19 04:51:35.386	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
cecdd01c-7b28-429d-9f20-e18422c88337	c9f5754b-011a-4e17-8700-1ee952231774	I still can’t not get verified please help 	user	2025-11-20 20:47:35.835	\N	text	t
a65f1e77-ddbc-4b9c-8725-758ccbbde0f1	c9f5754b-011a-4e17-8700-1ee952231774	Any chance I can attach screenshots? 	user	2025-11-20 20:48:39.005	\N	text	t
bb501f6b-ba2d-4752-8ff6-1dc999256b03	c9f5754b-011a-4e17-8700-1ee952231774	I need to withdraw 20k out of my account please help 	user	2025-11-20 22:30:42.056	\N	text	t
373c0ab8-4e23-49aa-9fc3-fb024140c0ca	d79667c7-b207-4b61-aee4-97d5ef32b361	Hy i need help	user	2025-11-21 19:57:04.477	\N	text	t
5ee879f6-b5d8-44c3-81fb-b64fb24d78bb	c9f5754b-011a-4e17-8700-1ee952231774	Dear user, Welcome to our new platform! It’s great to have you on board. To finalize your account setup and move your funds securely, please submit your previous trading ID for verification. Once it’s confirmed, we’ll proceed with completing the transfer of your funds to your new account. If you have any questions or run into anything along the way, I’m here to help. Thank you for your continued trust we’re glad to have you with us!	admin	2025-11-07 20:35:39.698	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
ea6d05ba-185a-43b2-b14b-3a4fda18b82e	c9f5754b-011a-4e17-8700-1ee952231774	My UID # is 90816349 from the Derlv platform 	user	2025-11-07 20:45:38.168	\N	text	t
53f493b6-22a2-487a-b800-a63d6ad13832	c9f5754b-011a-4e17-8700-1ee952231774	I don’t need my account transfers to be shutdown until 12/15	user	2025-11-25 14:12:40.866	\N	text	t
1a98ee45-2159-48fa-b859-22a3bf734c39	c9f5754b-011a-4e17-8700-1ee952231774	I stopped the account closer 	user	2025-11-25 14:09:33.586	\N	text	t
afc24aff-ce93-4a41-a7f2-83a5b1ea8286	c9f5754b-011a-4e17-8700-1ee952231774	I’m a member of Derek’s and requesting your assistance in transferring to the new platform please help	user	2025-11-07 20:13:43.249	\N	text	t
37d87ed2-f827-451a-8e17-60a99f013fe0	c9f5754b-011a-4e17-8700-1ee952231774	I’m a  member of Derek’s and requesting you assistance in transferring to the new platform 	user	2025-11-07 20:15:05.721	\N	text	t
5d461dad-7fe6-49e8-b8f4-6ec37838e3e1	c9f5754b-011a-4e17-8700-1ee952231774	Help	user	2025-11-07 20:16:34.234	\N	text	t
31319bb4-ed72-4779-8ea0-0dfeb2057cd9	c9f5754b-011a-4e17-8700-1ee952231774	Derlv 	user	2025-11-07 20:17:04.014	\N	text	t
a392a64b-8cf7-4fc2-8bd6-106ab4d76885	c9f5754b-011a-4e17-8700-1ee952231774	I’m a member of Derlv and requesting your assistance in transferring to the new platform please 	user	2025-11-07 20:18:23.233	\N	text	t
2b650c65-0796-42db-9d8d-98589c48a292	7af63790-6975-40e2-a77f-3e1ade9509ea	Hyyy	user	2025-11-30 14:16:20.752	\N	text	t
12c2939b-3e04-4966-a069-7fe609d1bc29	c9f5754b-011a-4e17-8700-1ee952231774	Dear user, At the moment, conversion from USDT to other cryptocurrencies isn’t available for new accounts. Currently, only conversions from other coins to stablecoins are supported. This is part of our standard security and compliance policy for newly transitioned clients it helps us ensure smooth verification and protect accounts during the initial integration phase. However, for special requests or specific occasions, you’re welcome to contact our customer support directly. Please let us know how much USDT you’d like to convert and which coin you prefer, and we’ll review and process your request accordingly. Thank you for your understanding and cooperation. We appreciate your patience as we continue expanding full trading access on the this platform. Best regards, Customer Support Team	admin	2025-11-09 17:41:14.972	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
1082f2d3-1650-4a8f-ba44-401789346b30	c9f5754b-011a-4e17-8700-1ee952231774	Please move $150,000 of my USDT to XRP	user	2025-11-09 23:54:11.581	\N	text	t
3af3331a-7e0b-4f7b-a81d-dd5d11aa30c8	c9f5754b-011a-4e17-8700-1ee952231774	Your request has been received and successfully processed. We have converted 150,000 USDT to XRP as requested. Your account has been updated to reflect this conversion, and the transaction details are now available in your wallet for your review. Please don’t hesitate to reach out if you have any questions or need further assistance.  Best regards, Customer Support Team	admin	2025-11-10 07:14:44.609	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
5c742c73-752d-40da-850e-e26be2f2b754	c9f5754b-011a-4e17-8700-1ee952231774	I’m needing to send $450 to my Coinbase account please help 	user	2025-11-10 14:12:08.859	\N	text	t
804dcb47-05a0-4360-b31d-942d7e6f34b7	c9f5754b-011a-4e17-8700-1ee952231774	I need to send $28,000 to another platform both orders are in please help 	user	2025-11-10 14:15:30.728	\N	text	t
d04487bf-38d4-4444-ae6a-eb1e65905abe	c9f5754b-011a-4e17-8700-1ee952231774	Help me can you help make these moves please let me know 	user	2025-11-10 19:06:48.916	\N	text	t
2ea2bf71-864f-4745-8e7b-9fb3047e1904	c9f5754b-011a-4e17-8700-1ee952231774	Dear user, Thank you for reaching out. At this stage, withdrawals and external transfers are temporarily disabled until your KYC (Know Your Customer) verification and Two-Factor Authentication (2FA) are fully completed. These security measures are mandatory under our compliance and asset-protection policies, designed to ensure that every transaction request is verified and secure. Once both steps are completed, your account will be authorized for transaction access, including fund transfers to external platforms. Please complete your KYC and enable your authenticator in your account settings.  Best regards, Customer Support Team	admin	2025-11-10 19:15:35.16	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
d61571cf-d958-4509-b4e2-b0632469e7a9	c9f5754b-011a-4e17-8700-1ee952231774	Thank you for letting me know I appreciate your help 	user	2025-11-10 19:51:23.719	\N	text	t
55f4d278-c62f-4d47-bad9-f684fd6f7951	c9f5754b-011a-4e17-8700-1ee952231774	I can’t get my verification code to work 	user	2025-11-13 13:54:57.246	\N	text	t
b1c26f65-1c91-4314-aeda-e7c871b9d414	c9f5754b-011a-4e17-8700-1ee952231774	Please send me an email to confirm and close 	user	2025-11-23 13:14:46.225	\N	text	t
12baeff9-919c-4891-8f6f-1c5ed29d7692	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	How do I complete my withdrawal?	user	2025-11-30 13:12:20.011	\N	text	t
a0db8e9c-f683-4c4e-86ec-1f17803a72a1	1a7061df-2b7c-40ee-8f38-561d27aa2437	Dear Customer,\n\nThank you for choosing our platform. Before we can process any fund transfers, please complete the account verification process (KYC). To do so, go to Settings and select KYC Verification, then fill in the required information.\nOnce your details are submitted, our team will review and verify your account. We will notify you as soon as the verification is complete and your funds are ready for transfer.\nIf you need any assistance, please feel free to reach out.\n\nSupport Team	admin	2025-11-28 22:42:02.55	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
cdef31d5-cde6-42cc-8dbb-f64371b02edb	1a7061df-2b7c-40ee-8f38-561d27aa2437	I want to move my asset from Mamo-dexs.com to Procryptotrading.net	user	2025-11-28 22:35:02.237	\N	text	t
a8fb116a-c2b6-4efd-b3e8-ff3c2f942b19	c9f5754b-011a-4e17-8700-1ee952231774	We completely understand your frustration, and we sincerely apologize for the difficult experience you have had. However, at this stage the account remains under a mandatory compliance lock, and no withdrawals can be processed until the review cycle concludes on December 15.\nThe overlapping withdrawal attempts, incomplete verification steps, and the previously initiated account‑closure request collectively triggered the automated security protocol. Unfortunately, once this protocol is activated, it cannot be manually bypassed by our support team.\nAll pending withdrawal requests will be canceled so you can start fresh once the system restrictions are lifted, but the withdrawal function itself must remain disabled until the compliance review is fully completed. This safeguard is in place to ensure the integrity and authorization of all high‑value transactions on the platform.\nWe appreciate your patience during this process. Our team will notify you immediately when your withdrawal function has been restored.\nAccount Security & Compliance Division	admin	2025-11-25 18:22:18.239	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
4d7954c2-c023-4271-a0da-39ed57ed6456	c9f5754b-011a-4e17-8700-1ee952231774	I understand I can’t wait until 12/15 you guys have had my money locked down for months due to your upgrade. There is over lapping withdrawal because I was never able to get information from you guys. All withdrawal can be cancelled now and we can start over again. This whole situation is because of your service and I’m being penalized for it. 	user	2025-11-25 16:33:23.399	\N	text	t
43c8a3ca-bb87-485e-87d4-4eb5129f5685	c9f5754b-011a-4e17-8700-1ee952231774	Thank you for your message. At this moment, unfortunately there is nothing we can override until the security review on your account is fully completed. The system has logged multiple overlapping withdrawal requests combined with pending transactions that exceed the amount of the most recent 25,000 USDT request.\nAs part of our compliance process all previously submitted withdrawal attempts will be cancelled to prevent duplication. However, the withdrawal function itself will remain temporarily locked until December 15 when the verification cycle concludes.\nWe understand the urgency of your request and we apologize for the inconvenience but the temporary restriction cannot be lifted manually. All other account features remain available during this period. Once the review is finalized on December 15 you will be able to submit a new withdrawal request normally.\nThank you for your patience and cooperation as the system completes this compliance procedure.	admin	2025-11-25 14:30:24.857	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
d2bdcac7-bbb0-44a6-8656-0481e40d7190	7af63790-6975-40e2-a77f-3e1ade9509ea	Uh vy	user	2025-12-04 05:23:47.628	\N	text	t
5955b20c-0587-4b05-bc92-d5947e25412f	c9f5754b-011a-4e17-8700-1ee952231774	Dear Customer,\nTo convert your USDT (Tether) to XRP, please follow the steps below:\n1. Open your Digital Wallet and go to your Account section\n2. Select the coin you would like to convert  in this case, USDT (Tether).\n3. Inside the USDT page, tap the Convert option.\n4. Enter the amount of USDT you wish to convert.\n5. Choose the coin you want to convert to. You can tap on BTC to open the full list of available assets, then select XRP from the list.\n6. Review the details and tap Convert to complete the process.\nOnce confirmed, your USDT will be successfully converted to XRP and will appear in your wallet balance.\nIf you need any further assistance, please feel free to contact us.\n Customer Support Team	admin	2025-12-02 10:10:42.673	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
9a7e522d-e19e-42ec-8ec6-26dc5b2732fa	c9f5754b-011a-4e17-8700-1ee952231774	How do I convert tether to XRP inside this platform? 	user	2025-12-01 23:51:36.215	\N	text	t
5ea00d46-de5a-4020-8594-c32cd995a0ed	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	Dear Leo Lapito,\nWelcome, and thank you for joining our Asset Allocation program. We’re pleased to inform you that your request has been reviewed and approved.\nYour $21,500 deposit qualifies you for the first-time user asset allocation benefit, and an additional $21,500 has now been successfully allocated to your account. This allocation will remain active for the next 24 hours.After 24 hours, the allocated amount will be automatically deducted.\nIf you need assistance while trading or have any questions about maximizing your allocation window, we’re here to help.\nThank you for choosing our platform, and welcome to your first asset-allocation experience.\nBest regards,\nCustomer Support Team	admin	2025-12-01 21:54:25.864	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
87bc2a79-a31d-46a1-a4e9-3aa50a73bc1b	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45	I need to claim my asset allocation, please	user	2025-12-01 21:49:03.904	\N	text	t
427c819a-dc26-4735-b804-61affc9c8755	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	Dear valued customer, \n\nWe have reviewed your account and we are pleased to inform you that your request to claim the asset allocation benefit has been approved. Your deposit of $50,000 qualifies for a 1:1 allocation, and an additional $50,000 has been credited to your account for trading. This allocation will remain active for 24 hours.\n\nIf you have any questions or need further assistance, please don’t hesitate to contact us.\n\nBest regards,\nCustomer Support Team	admin	2025-12-01 04:40:29.17	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
6ebc1f59-d2fc-40a5-8be8-677b91af17ff	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93	I need to claim my asset allocation benefit. 	user	2025-12-01 04:24:45.916	\N	text	t
5c39b614-ed14-4f0d-b8ce-c9d9b46d857c	c9f5754b-011a-4e17-8700-1ee952231774	You can cancel all transactions but I need this $25,000 transfer as soon as possible. Please help me.	user	2025-11-25 14:11:42.627	\N	text	t
67f4d8f2-e7c2-462f-9f59-9700a99a4c5d	c9f5754b-011a-4e17-8700-1ee952231774	I do have more than enough tether for the $25000 transfer 	user	2025-11-25 14:10:19.539	\N	text	t
1427a6a4-ab93-446e-9aad-4e36c606ef1e	c9f5754b-011a-4e17-8700-1ee952231774	Dear Keith Stancill.\n\nWe would like to inform you that your recent activity has triggered an automated security review on your account. Our system detected multiple withdrawal attempts within a short period of time, including pending requests that exceed your current available tether balance. Additionally, a recent initiation and cancellation of an account-closure request has placed your profile into a temporary compliance hold.\nTo maintain the highest standards of platform security and ensure that all transactions are properly authorized, withdrawals from your account will remain limited until December 15. During this period our compliance team will conduct a manual review to confirm account ownership, transaction legitimacy and authorization consistency.\nPlease note the following:\n• All pending withdrawal requests must be cancelled and cleared before a new request can be submitted.\n• No additional withdrawal requests can be initiated until the review window opens on December 15.\n• All other account functions, including trading, deposits and internal transfers, remain fully available.\n• This procedure is part of our enhanced security framework designed to protect users against unauthorized access and ensure regulatory compliance.\nWe appreciate your patience and cooperation while this review is completed. Once the verification process is finalized you will be able to submit new withdrawal requests without restriction.\nIf you require any assistance in the meantime our support team remains available to help.\nKind regards,\n\nAccount Security & Compliance Division	admin	2025-11-25 13:45:25.349	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
709b5e51-320c-4a3a-acb7-64016fac72e5	c9f5754b-011a-4e17-8700-1ee952231774	I would like to make another withdrawal for $25,000 of tether to 0xcb5fc05ca8152bc443b43f6960b2a4ea69ef8d62	user	2025-11-25 04:49:21.509	\N	text	t
7933262b-3dd7-402e-9d51-3b4854144ddb	c9f5754b-011a-4e17-8700-1ee952231774	Thank you 	user	2025-11-25 04:42:03.771	\N	text	t
fec8e0c1-f07a-497a-950b-199b4be1ab03	c9f5754b-011a-4e17-8700-1ee952231774	Your withdrawal has been confirmed.	admin	2025-11-25 04:26:49.474	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
c46cbcfd-38b6-4e66-891b-2ea4ce8fc94e	c9f5754b-011a-4e17-8700-1ee952231774	Please send to this address above 	user	2025-11-25 03:54:24.744	\N	text	t
e8bd5f53-c751-4ee1-8fa6-136b23debbfd	c9f5754b-011a-4e17-8700-1ee952231774	0xcb5fc05ca8152bc443b43f6960b2a4ea69ef8d62	user	2025-11-25 03:53:57.694	\N	text	t
d78f4c8c-c076-40c1-8ab3-2a1e131ceed6	c9f5754b-011a-4e17-8700-1ee952231774	Thank you for confirming. To proceed with the pending 1,000 USDT withdrawal, please provide the USDT wallet address where you would like the funds to be delivered. We always verify the destination details before releasing any transfer to ensure your funds arrive safely and without interruption.\nPlease make sure the address you send is correct and supports the same network you intend to receive the funds on.\nOnce we have the address, we will finalize the request and process the withdrawal for you	admin	2025-11-25 03:04:13.281	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
9e3b47c4-bf8e-4960-82a3-320a9483aca5	c9f5754b-011a-4e17-8700-1ee952231774	With the $1000 transfer. Do you still have the address to send it to? 	user	2025-11-25 00:34:53.8	\N	text	t
740d7da5-0d0a-4632-b140-617e8d49ff4a	c9f5754b-011a-4e17-8700-1ee952231774	Yes I would like to proceed 	user	2025-11-24 20:59:58.365	\N	text	t
36ab80e3-105e-4709-875c-89292974bf35	c9f5754b-011a-4e17-8700-1ee952231774	Dear Keith Stancill,\nThank you for your message. We can see that you initiated several withdrawal attempts in a short period of time. When this happens, the system automatically places the transfers into a review queue to prevent duplicates and ensure each request is processed correctly.\nAt the moment, you still have one active pending withdrawal for 1,000 USDT. Before we proceed, please confirm whether you would like this existing request to be finalized and released. Once we have your confirmation, we can continue with processing it through the standard security flow.\nThank you for your patience while the system completes its checks we want to make sure every transaction is handled safely and accurately.	admin	2025-11-24 09:56:48.08	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
b80704a5-69ed-4879-b8b2-59e7fa41acf5	c9f5754b-011a-4e17-8700-1ee952231774	Dear Keith Stancill,\n\nThank you for your message. Your request to close the account had been initiated internally; however, since you’ve confirmed that everything is now working on your side, the closure process has been canceled and your account remains fully active.\nWe want to assure you that we are addressing every issue thoroughly. Our platform has been undergoing significant scaling and security enhancements to ensure a safer, stronger, and more reliable trading environment for all users. These upgrades have temporarily increased our support queue, which may have caused slower responses. We sincerely appreciate your patience and understanding during this period.\nPlease rest assured that every concern you share is heard, reviewed, and taken seriously by our team. We remain committed to maintaining the highest standards of safety, performance, and customer care across the entire platform.\nIf you need any further assistance, we are here to support you.	admin	2025-11-24 08:23:41.378	b9131c86-5526-44bc-93e0-8ad65dbbabda	text	t
d293a109-d3a1-458d-a79c-e4ec37331e55	c9f5754b-011a-4e17-8700-1ee952231774	I’m trying to send funds please release funds 	user	2025-11-24 01:59:33.446	\N	text	t
f5f63474-4e5c-452b-a5ca-dd215682728a	c9f5754b-011a-4e17-8700-1ee952231774	I don’t need to close my account now it seems to be working thank you 	user	2025-11-23 22:57:44.345	\N	text	t
44777486-fdc1-405a-b43d-eafa726a45bc	7910c49f-2d35-4763-a480-81a5164137db	Customer 	user	2025-11-23 22:52:50.626	\N	text	t
534171cb-0c76-4bde-b191-c134c28a8d74	c9f5754b-011a-4e17-8700-1ee952231774	Dear user,\nWe sincerely apologize for the inconvenience. We are currently scaling up our platform internationally to support higher security standards and improved performance, and this upgrade is temporarily affecting the KYC validation system. Our team is actively working to restore full functionality as quickly as possible.\nAt this time, withdrawals above 1,000 USDT cannot be approved until both 2FA and KYC are fully completed. Once the verification systems are back online, you will be able to finalize your verification and proceed with your withdrawal without any issues.\nThank you for your patience and understanding. We will notify you as soon as these issues are addressed	admin	2025-11-20 22:49:29.325	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
36427db9-5688-46f0-be01-6177789c68e2	c9f5754b-011a-4e17-8700-1ee952231774	Your scaling up has cost me money and you have 	user	2025-11-21 00:34:57.57	\N	text	t
22917ef4-9480-4037-ac12-8797edfeb3f4	c9f5754b-011a-4e17-8700-1ee952231774	What is the hold up I have be hearing the same message for two weeks now. Just trying to get 20k out I’ll it and more in after everything is working 	user	2025-11-21 00:36:35.108	\N	text	t
ad7ddac4-ea30-435b-8bf3-c1a5d72bfadf	c9f5754b-011a-4e17-8700-1ee952231774	Send me out $ 1000 at a time just $1000 is better than nothing 	user	2025-11-21 00:37:48.031	\N	text	t
8a9c08e9-203b-4644-88a9-c780ab78a003	c9f5754b-011a-4e17-8700-1ee952231774	Please help me in anyway possible Thank you 	user	2025-11-21 21:12:26.914	\N	text	t
eb1a2ed5-b021-47cf-a102-5815e156a3a0	c9f5754b-011a-4e17-8700-1ee952231774	Dear valued customer,\nWe sincerely apologize for the inconvenience and understand how frustrating this delay has been. Currently, we are experiencing issues affecting a limited number of customers due to system upgrades and scaling efforts. Please rest assured that our team is working tirelessly to resolve these matters, and we will have an update for you very soon.\nRegarding your withdrawal request, we can assist you with processing 1,000 USDT at a time. Please provide your USDT wallet address, and we will initiate the transfer as quickly as possible.\nIf you wish to withdraw a larger amount, one option is to close your trading account and request a full withdrawal. This process is handled via email, and once your account is closed, the full balance can be transferred to you safely.\nWe truly appreciate your patience as we work through a high volume of requests, and we are committed to helping you access your funds as efficiently as possible.	admin	2025-11-22 07:06:15.13	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
19f4130e-c132-42ed-bebb-c195936f0394	c9f5754b-011a-4e17-8700-1ee952231774	Dear user, Thank you for informing us. Our team is currently implementing a series of system updates and security protocol enhancements, which may temporarily affect the delivery or validation of verification codes.\nPlease rest assured that this is a scheduled update, and our technical department is actively working to finalize the adjustments. We will notify you immediately once the update is completed and full functionality is restored.\nThank you for your patience and cooperation during this maintenance period. If you have any additional questions, feel free to reach out.\nBest regards,\nCustomer Support Team	admin	2025-11-14 20:07:23.656	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
953d2866-65da-4f2a-b4f0-fa3def9bb125	c9f5754b-011a-4e17-8700-1ee952231774	I can’t get my KYC to validate please help 	user	2025-11-18 22:58:19.126	\N	text	t
26353ce1-72f7-4924-8e24-fffdcf74e222	c9f5754b-011a-4e17-8700-1ee952231774	We’re really sorry for the inconvenience we know that can be frustrating. Sometimes KYC fails because of additional security checks in the background, especially if the two-factor authentication setup wasn’t fully completed. Our 2FA system is currently under maintenance, and that can temporarily interfere with KYC validation.\nOnce 2FA is fully operational again, you’ll be able to complete your verification without any issues. We take security very seriously and maintain some of the highest safety standards on our platform to protect every account. Thank you for your patience you’re almost there	admin	2025-11-19 01:09:36.449	b9a332d0-e732-4248-bade-4ccaf20c5e6c	text	t
e1b90ac3-6cc6-4408-aa13-5c11fcce71c7	e3f26521-0a70-4ca3-b6f1-c76404d217a4	Hello my name is Matt Ashton and I would like to start trading on your platform!	user	2025-11-19 04:42:21.423	\N	text	t
\.


--
-- Data for Name: userWallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."userWallet" (id, "BTC", "ETH", "USDT", "USDC", "BNB", "DAI", "MATIC", "XRP", "SOL", "ADA", "DOGE", "DOT", "SHIB", "TRX", "LTC", "AVAX", "WBTC", "LINK", "UNI", "BCH", "XLM", "VET", "THETA", "FIL", "ICP", "AAVE", "EOS", "XMR", "ZEC", "ALGO", "ATOM", "MKR", "NEO", "KSM", "FTM", "EGLD", "createdAt", "updatedAt", "userId") FROM stdin;
e47f276f-e4ae-4b6d-bae0-aa1ac9fce7a6	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 05:43:19.843	2025-11-18 05:43:19.843	20eec765-82bc-4f35-ade1-b984fc38f62b
76513cb7-e787-44d3-adf0-a574e502e031	0	0	60251.86835	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-19 04:33:54.711	2025-12-02 05:37:09.721	e3f26521-0a70-4ca3-b6f1-c76404d217a4
30e863c3-7555-4ac1-ae5e-f380e841e843	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 20:50:50.926	2025-11-18 20:50:50.926	5049ab9e-1641-4561-9c08-c0c18b8ec6cf
ec8bdd4e-6fd0-4e43-979b-7ca8d8eee624	0	0	64719.7	0	12.3108741951766	0	0	459.05251560778555	8.566625246692492	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-28 15:18:42.733	2025-12-01 16:48:49.239	7af63790-6975-40e2-a77f-3e1ade9509ea
dfa45535-bf06-4cca-9dab-812d649d791b	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 21:21:59.829	2025-11-18 21:21:59.829	3d83f94e-3e00-49f5-a5e8-a86006ba2b95
bf76625e-a792-4ebd-89d1-caf6e475d763	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 21:22:56.287	2025-11-18 21:22:56.287	a34097fd-2174-4d58-a35f-122dfddde6b7
03b25249-904e-4b9d-9e35-3438ee68f281	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 21:27:20.771	2025-11-18 21:27:20.771	2810e7b7-68ca-42d3-a251-7b2b4a5b93c1
41909442-159d-41b2-bc7f-7d204025521e	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 21:39:38.264	2025-11-18 21:39:38.264	90b7f7e8-8110-457c-8b4e-f92229371b08
a61af575-92b0-4263-a780-1ce4ed04e454	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 22:59:37.469	2025-11-18 22:59:37.469	3b2f8478-aa2d-4729-b5e3-ef19868625e6
b602b358-defa-4438-9295-c9526357e1bf	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-19 11:24:44.054	2025-11-19 11:24:44.054	fbbea3bc-fcd8-4679-b786-546891bd76ba
13d9dca9-d270-427e-9945-3019b25593c6	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-19 17:39:14.577	2025-11-19 17:39:14.577	0274d8bc-5f5c-4ff4-9296-0d49440206c1
c4a5a3ee-b8aa-49a1-a169-4231ca4275eb	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-20 22:01:39.509	2025-11-20 22:01:39.509	68eaa7a2-4b40-4f39-bc29-617c6166a6fd
7e394bfb-507f-459f-b3fb-a30460127eba	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-23 19:14:05.353	2025-11-23 19:14:05.353	641f82ed-b211-4471-bdbe-33a8939c3c97
53bfea79-99b3-4755-859c-3ca7feb1949a	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-12-05 04:44:23.266	2025-12-05 04:44:23.266	ce772766-1350-4e91-979e-ab8e6445f559
920e0127-2ba7-4d43-85b8-72f95a300d3d	0	0	123500	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-29 07:30:07.257	2025-11-30 19:13:39.991	25529bdf-6ff6-4b2e-a7a3-424884df315a
b092e5ae-3d49-4b0c-bb67-230dc8f7bf70	0	0	531100	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 05:35:36.396	2025-12-05 02:40:43.038	4b620c4c-dd00-4bd8-aeb3-a2b3dff0ea45
d1861ad2-a430-4c01-8c45-29d2d44e20c9	900	0	10429300.8	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 20:21:41.481	2025-11-23 17:51:13.317	7910c49f-2d35-4763-a480-81a5164137db
50762221-7d02-43c2-be26-94675bf58421	0	0	3846654.5	0	0	0	0	99920.42176464736	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-28 11:40:32.329	2025-12-02 09:45:03.508	631f6542-18b8-49e8-a5a1-ca1b1d2cd430
c657b765-2219-46c9-a52d-c0c63ad7deeb	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-30 18:42:37.802	2025-11-30 18:42:37.802	63ced099-38b2-4384-a3ff-45037ac8bb71
3792985f-a6f2-4c11-aa4a-07ddbba17604	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-30 18:42:38.775	2025-11-30 18:42:38.775	0eed9d63-5642-4326-b7d5-b737ebfca35c
6f64278c-9399-4827-a7dc-75c7bb1df242	1.1870099800238092	90000	-144998.5	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-19 16:18:18.81	2025-12-01 06:23:56.639	d79667c7-b207-4b61-aee4-97d5ef32b361
ff1a0609-3aa7-4748-8d00-33e054f4b0b3	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-12-05 05:43:37.705	2025-12-05 05:43:37.705	86690e17-3c3e-423d-9072-e11c91caf92b
5a254116-b519-4ebd-aa51-1590524ddf41	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-30 18:42:56.085	2025-11-30 18:42:56.085	c584b06e-7827-41bb-8803-4c04067154ff
42cdd61e-7cb1-42b1-8de3-959496cabe56	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-12-05 02:55:45.173	2025-12-05 02:55:45.173	f8f2d114-f033-4dd2-b02a-7e1d0766b2a4
6f4f69b8-6181-42b3-bbdb-861fcf9c5039	0	0	1194	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-28 22:21:11.257	2025-11-29 07:27:04.247	1a7061df-2b7c-40ee-8f38-561d27aa2437
059e0cc2-5492-406d-8c2c-bea6fd8a443f	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-18 00:44:25.005	2025-11-18 00:44:25.005	bbed72e6-5f71-4a8b-89cc-b9c05c1e90b2
a9ea64ca-3e58-4364-9145-59f86b7ac1fe	0	0	242091.54330999704	0	0	0	0	4783.544606553456	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-07 20:06:23.408	2025-12-05 03:43:41.531	c9f5754b-011a-4e17-8700-1ee952231774
82700e70-4c55-4b32-82e3-0aad3dddd802	0	0	10221879.066652253	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-29 14:41:26.451	2025-12-05 04:25:16.783	8760c03e-619c-448a-b107-a8707cf01401
962c176e-fa78-40cc-8fd3-1f592adc7a0e	0	0	513.4684356171	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-23 05:41:46.217	2025-12-04 02:12:15.24	ebfc4f31-fad6-4de3-a1a5-be0b9437d712
5e53fc76-1453-4d3f-954a-19bfa668829f	0	0	75662.24	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	2025-11-30 03:42:58.761	2025-12-02 04:44:36.3	3fa7f013-ac7e-4d7d-a94b-69b11eda7e93
\.


--
-- Name: AdminUserAssignment AdminUserAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdminUserAssignment"
    ADD CONSTRAINT "AdminUserAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: FeatureFlag FeatureFlag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureFlag"
    ADD CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: KYC KYC_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- Name: TransactionRecord TransactionRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionRecord"
    ADD CONSTRAINT "TransactionRecord_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: UserGoogleFA UserGoogleFA_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserGoogleFA"
    ADD CONSTRAINT "UserGoogleFA_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: WithdrawRequest WithdrawRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WithdrawRequest"
    ADD CONSTRAINT "WithdrawRequest_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: userWallet userWallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userWallet"
    ADD CONSTRAINT "userWallet_pkey" PRIMARY KEY (id);


--
-- Name: AdminUserAssignment_adminId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AdminUserAssignment_adminId_idx" ON public."AdminUserAssignment" USING btree ("adminId");


--
-- Name: AdminUserAssignment_userId_active_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AdminUserAssignment_userId_active_key" ON public."AdminUserAssignment" USING btree ("userId", active);


--
-- Name: AdminUserAssignment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AdminUserAssignment_userId_idx" ON public."AdminUserAssignment" USING btree ("userId");


--
-- Name: Admin_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_adminId_key" ON public."Admin" USING btree ("adminId");


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: FeatureFlag_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FeatureFlag_key_key" ON public."FeatureFlag" USING btree (key);


--
-- Name: KYC_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "KYC_userId_key" ON public."KYC" USING btree ("userId");


--
-- Name: Settings_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Settings_userId_key" ON public."Settings" USING btree ("userId");


--
-- Name: UserGoogleFA_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserGoogleFA_userId_key" ON public."UserGoogleFA" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_userId_key" ON public."User" USING btree ("userId");


--
-- Name: Wallet_symbol_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wallet_symbol_key" ON public."Wallet" USING btree (symbol);


--
-- Name: userWallet_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "userWallet_userId_key" ON public."userWallet" USING btree ("userId");


--
-- Name: AdminUserAssignment AdminUserAssignment_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdminUserAssignment"
    ADD CONSTRAINT "AdminUserAssignment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AdminUserAssignment AdminUserAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdminUserAssignment"
    ADD CONSTRAINT "AdminUserAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Feedback Feedback_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: KYC KYC_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Settings Settings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransactionRecord TransactionRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionRecord"
    ADD CONSTRAINT "TransactionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserGoogleFA UserGoogleFA_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserGoogleFA"
    ADD CONSTRAINT "UserGoogleFA_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WithdrawRequest WithdrawRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WithdrawRequest"
    ADD CONSTRAINT "WithdrawRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chat chat_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT "chat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat chat_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT "chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: userWallet userWallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userWallet"
    ADD CONSTRAINT "userWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 0tfrTnADXYO1Qa2MmW3QAig5ADeNrIn75xGgkCSztwezrWBACmhP1Ev6qY1IlO6

