import { useEffect, useState } from "react";
import Home from "./pages/Home";
import CaseDetail from "./pages/CaseDetail";
import Learn from "./pages/Learn";

// 用 hash 路由，靜態檔放在 NAS 任何位置都不需要額外的伺服器設定
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.replace(/^#/, "") || "/";
}

export default function App() {
  const route = useHash();
  const caseMatch = route.match(/^\/case\/(.+)$/);

  let page;
  if (caseMatch) page = <CaseDetail id={decodeURIComponent(caseMatch[1])} />;
  else if (route === "/learn") page = <Learn />;
  else page = <Home />;

  return (
    <>
      <header className="site-header">
        <a href="#/" className="brand">土地使用計劃</a>
        <nav>
          <a href="#/" className={route === "/" ? "active" : ""}>案件總覽</a>
          <a href="#/learn" className={route === "/learn" ? "active" : ""}>白話小教室</a>
        </nav>
      </header>
      <p className="tagline">全台正在進行的區段徵收、市地重劃、產業與科學園區，用白話一次看懂。</p>
      <main>{page}</main>
      <footer className="site-footer">
        資料整理自政府公開資訊與媒體報導，每案附來源；以政府正式公告為準。
      </footer>
    </>
  );
}
