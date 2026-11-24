import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fernloop Walking Club", template: "%s | Fernloop Walking Club" },
  description: "A walking club for slow walks, shared field notes, and good company outdoors.",
};

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Fernloop Walking Club home">
      <Image src="/walking-club/mark.svg" alt="" width={46} height={46} />
      <span>Fernloop<small>Walking Club</small></span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header>
          <div className="shell masthead">
            <Brand />
            <nav aria-label="Main navigation">
              <a className="nav-link" href="/#welcome">The club</a>
              <a className="nav-link" href="/#notes">Field notes</a>
              <a className="button solid" href="/join">Join the whitelist</a>
            </nav>
          </div>
        </header>
        {children}
        <footer>
          <div className="shell foot"><Brand /><a href="/#welcome">About the club</a></div>
        </footer>
      </body>
    </html>
  );
}
