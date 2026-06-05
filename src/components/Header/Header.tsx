import { useMatches } from "@tanstack/react-router";
import styles from "./Header.module.css";

export const Header = () => {
  const matches = useMatches();

  const breadcrumbs = matches
    .filter((match) => match.staticData?.breadcrumb)
    .map((match) => ({
      label: match.staticData?.breadcrumb,
      headline: match.staticData?.headline,
      path: match.pathname,
    }));

  return (
    <header className={styles.wrapper}>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className={styles.header}>
          <span className={styles.eyebrow}>
            Página administrativa / {crumb.label}
            {index < breadcrumbs.length - 1 && " / "}
          </span>
          <h2>{crumb.headline}</h2>
        </div>
      ))}
    </header>
  );
};


