import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "競馬SNS指数",
  description: "公開されている競馬予想を集約し、支持率・SNS指数とその推移を可視化（SNS集合知）",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <h1>
            競馬SNS指数 <span className="tag">— SNS集合知で見る支持率とその推移</span>
          </h1>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
