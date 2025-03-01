import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import favicon from "./favicon.png";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Azúcar</title>
                <link rel="icon" href={favicon.src} />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
