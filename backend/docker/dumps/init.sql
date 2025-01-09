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
-- Name: enum_Profiles_cleaningHabits; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Profiles_cleaningHabits" AS ENUM (
    'Low',
    'Medium',
    'High'
);


ALTER TYPE public."enum_Profiles_cleaningHabits" OWNER TO admin;

--
-- Name: enum_Profiles_noiseLevel; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."enum_Profiles_noiseLevel" AS ENUM (
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

--
-- Name: delete_old_unverified_users(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.delete_old_unverified_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM public."Users"
  WHERE "verified" = false
    AND "createdAt" < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.delete_old_unverified_users() OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


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
-- Name: Users clean_up_unverified_users; Type: TRIGGER; Schema: public; Owner: admin
--

CREATE TRIGGER clean_up_unverified_users BEFORE INSERT ON public."Users" FOR EACH ROW EXECUTE FUNCTION public.delete_old_unverified_users();


--
-- PostgreSQL database dump complete
--

