import type { Metadata } from "next";
import Image from "next/image";
import JoinDemo from "./join-demo";
import styles from "./join.module.css";

export const metadata: Metadata = { title: "Club whitelist" };

export default function JoinPage() {
  return (
    <main className={styles.stage} id="main">
      <div className={styles.card}>
        <div className={styles.panel}>
          <p className="eyebrow">Club whitelist</p>
          <JoinDemo />
        </div>
        <div className={styles.photo}>
          <Image src="/walking-club/woodland.webp" alt="" fill sizes="(min-width: 720px) 25rem, 0px" />
        </div>
      </div>
    </main>
  );
}
