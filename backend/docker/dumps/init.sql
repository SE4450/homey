--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

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
-- Name: enum_Conversations_type; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Conversations_type" AS ENUM (
    'dm',
    'group'
);


ALTER TYPE public."enum_Conversations_type" OWNER TO admin;

--
-- Name: enum_Participants_role; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Participants_role" AS ENUM (
    'tenant',
    'landlord'
);


ALTER TYPE public."enum_Participants_role" OWNER TO admin;

--
-- Name: enum_Profiles_cleaningHabits; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Profiles_cleaningHabits" AS ENUM (
    '',
    'Low',
    'Medium',
    'High'
);


ALTER TYPE public."enum_Profiles_cleaningHabits" OWNER TO admin;

--
-- Name: enum_Profiles_noiseLevel; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Profiles_noiseLevel" AS ENUM (
    '',
    'Low',
    'Medium',
    'High'
);


ALTER TYPE public."enum_Profiles_noiseLevel" OWNER TO admin;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'landlord',
    'tenant'
);


ALTER TYPE public."enum_Users_role" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Conversations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Conversations" (
    id integer NOT NULL,
    type public."enum_Conversations_type" NOT NULL,
    name character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Conversations" OWNER TO admin;

--
-- Name: Conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Conversations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Conversations_id_seq" OWNER TO admin;

--
-- Name: Conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Conversations_id_seq" OWNED BY public."Conversations".id;


--
-- Name: Expenses; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Expenses" (
    id integer NOT NULL,
    "expenseName" character varying(255) NOT NULL,
    amount double precision NOT NULL,
    "owedTo" integer NOT NULL,
    "paidBy" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Expenses" OWNER TO admin;

--
-- Name: Expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Expenses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Expenses_id_seq" OWNER TO admin;

--
-- Name: Expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Expenses_id_seq" OWNED BY public."Expenses".id;


--
-- Name: Inventories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Inventories" (
    "itemId" integer NOT NULL,
    "houseId" integer NOT NULL,
    "itemName" character varying(255) NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Inventories" OWNER TO admin;

--
-- Name: Inventories_itemId_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Inventories_itemId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Inventories_itemId_seq" OWNER TO admin;

--
-- Name: Inventories_itemId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Inventories_itemId_seq" OWNED BY public."Inventories"."itemId";


--
-- Name: Items; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Items" (
    "itemId" integer NOT NULL,
    "listId" integer NOT NULL,
    item character varying(255) NOT NULL,
    "assignedTo" character varying(255),
    purchased integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Items" OWNER TO admin;

--
-- Name: Items_itemId_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Items_itemId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Items_itemId_seq" OWNER TO admin;

--
-- Name: Items_itemId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Items_itemId_seq" OWNED BY public."Items"."itemId";


--
-- Name: Lists; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Lists" (
    "listId" integer NOT NULL,
    "userId" integer NOT NULL,
    "listName" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Lists" OWNER TO admin;

--
-- Name: Lists_listId_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Lists_listId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Lists_listId_seq" OWNER TO admin;

--
-- Name: Lists_listId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Lists_listId_seq" OWNED BY public."Lists"."listId";


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Messages" (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    "senderId" integer NOT NULL,
    content text NOT NULL,
    "readBy" json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO admin;

--
-- Name: Messages_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Messages_id_seq" OWNER TO admin;

--
-- Name: Messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Messages_id_seq" OWNED BY public."Messages".id;


--
-- Name: Participants; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Participants" (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    "userId" integer NOT NULL,
    role public."enum_Participants_role" DEFAULT 'tenant'::public."enum_Participants_role",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Participants" OWNER TO admin;

--
-- Name: Participants_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Participants_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Participants_id_seq" OWNER TO admin;

--
-- Name: Participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Participants_id_seq" OWNED BY public."Participants".id;


--
-- Name: Profiles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Profiles" (
    id integer NOT NULL,
    "cleaningHabits" public."enum_Profiles_cleaningHabits",
    "noiseLevel" public."enum_Profiles_noiseLevel",
    "sleepStart" character varying(255),
    "sleepEnd" character varying(255),
    alergies character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Profiles" OWNER TO admin;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" NOT NULL,
    verified boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Users" OWNER TO admin;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO admin;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.stores (
    "itemID" integer NOT NULL,
    "itemName" character varying(255),
    store character varying(255) NOT NULL,
    price character varying(255) NOT NULL,
    "storeLink" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.stores OWNER TO admin;

--
-- Name: stores_itemID_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."stores_itemID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."stores_itemID_seq" OWNER TO admin;

--
-- Name: stores_itemID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."stores_itemID_seq" OWNED BY public.stores."itemID";


--
-- Name: Conversations id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Conversations" ALTER COLUMN id SET DEFAULT nextval('public."Conversations_id_seq"'::regclass);


--
-- Name: Expenses id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Expenses" ALTER COLUMN id SET DEFAULT nextval('public."Expenses_id_seq"'::regclass);


--
-- Name: Inventories itemId; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Inventories" ALTER COLUMN "itemId" SET DEFAULT nextval('public."Inventories_itemId_seq"'::regclass);


--
-- Name: Items itemId; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Items" ALTER COLUMN "itemId" SET DEFAULT nextval('public."Items_itemId_seq"'::regclass);


--
-- Name: Lists listId; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Lists" ALTER COLUMN "listId" SET DEFAULT nextval('public."Lists_listId_seq"'::regclass);


--
-- Name: Messages id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Messages" ALTER COLUMN id SET DEFAULT nextval('public."Messages_id_seq"'::regclass);


--
-- Name: Participants id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Participants" ALTER COLUMN id SET DEFAULT nextval('public."Participants_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: stores itemID; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stores ALTER COLUMN "itemID" SET DEFAULT nextval('public."stores_itemID_seq"'::regclass);


--
-- Name: Conversations Conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Conversations"
    ADD CONSTRAINT "Conversations_pkey" PRIMARY KEY (id);


--
-- Name: Expenses Expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_pkey" PRIMARY KEY (id);


--
-- Name: Inventories Inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Inventories"
    ADD CONSTRAINT "Inventories_pkey" PRIMARY KEY ("itemId");


--
-- Name: Items Items_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Items"
    ADD CONSTRAINT "Items_pkey" PRIMARY KEY ("itemId");


--
-- Name: Lists Lists_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Lists"
    ADD CONSTRAINT "Lists_pkey" PRIMARY KEY ("listId", "userId");


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: Participants Participants_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Participants"
    ADD CONSTRAINT "Participants_pkey" PRIMARY KEY (id);


--
-- Name: Profiles Profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Profiles"
    ADD CONSTRAINT "Profiles_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY ("itemID");


--
-- Name: Expenses Expenses_owedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_owedTo_fkey" FOREIGN KEY ("owedTo") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expenses Expenses_paidBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Participants Participants_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Participants"
    ADD CONSTRAINT "Participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Participants Participants_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Participants"
    ADD CONSTRAINT "Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

