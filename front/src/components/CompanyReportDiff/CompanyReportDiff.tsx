import { ScrollSync, ScrollSyncNode } from "scroll-sync-react";
import styles from "./CompanyReportDiff.module.css";
import { ReportComparisonData } from "../../types";
import { RefObject, useEffect, useRef } from "react";
import React from "react";

type CompanyReportDiffProps = {
  cik?: string;
  reportsData: ReportComparisonData | null;
};

const MemoizedCompanyReportDiff = ({ reportsData }: CompanyReportDiffProps) => {
  const iframe1Ref = useRef<HTMLIFrameElement>(null);
  const iframe2Ref = useRef<HTMLIFrameElement>(null);

  const handleScroll = (
    sourceIframe: RefObject<HTMLIFrameElement | null>,
    targetIframe: RefObject<HTMLIFrameElement | null>
  ) => {
    return () => {
      if (sourceIframe?.current && targetIframe?.current) {
        if (targetIframe.current?.contentWindow) {
          targetIframe.current.contentWindow.scrollTo(
            sourceIframe.current.contentWindow?.scrollX || 0,
            sourceIframe.current.contentWindow?.scrollY || 0
          );
        }
      }
    };
  };

  useEffect(() => {
    const iframe1 = iframe1Ref.current;
    const iframe2 = iframe2Ref.current;

    if (iframe1 && iframe2) {
      const scrollHandler1 = handleScroll(iframe1Ref, iframe2Ref);
      const scrollHandler2 = handleScroll(iframe2Ref, iframe1Ref);

      iframe1.contentWindow?.addEventListener("scroll", scrollHandler1);

      iframe2.contentWindow?.addEventListener("scroll", scrollHandler2);

      return () => {
        iframe1.contentWindow?.removeEventListener("scroll", scrollHandler1);
        iframe2.contentWindow?.removeEventListener("scroll", scrollHandler2);
      };
    }
  }, []);

  if (!reportsData?.latestReport?.url || !reportsData?.previousReport?.url) {
    return <div className={styles.container}>No URL Report found.</div>;
  }

  return (
    <div className={styles.container}>
      <ScrollSync>
        <div className={styles.reportsContainer}>
          <div className={styles.reportPane}>
            <h3>Previous</h3> Period Ending:{" "}
            {reportsData.previousReport.periodEnding}
            <ScrollSyncNode group={"scroll"} scroll="syncer-only">
              <div className={styles.iframeWrapper}>
                <iframe
                  ref={iframe1Ref}
                  src={reportsData.previousReport.url}
                  title="Relatório Anterior"
                  className={styles.iframe}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </ScrollSyncNode>
          </div>
          <div className={styles.reportPane}>
            <h3>Latest </h3> Period Ending:{" "}
            {reportsData.latestReport.periodEnding}
            <ScrollSyncNode group={"scroll"} scroll="syncer-only">
              <div className={styles.iframeWrapper}>
                {/* {" "} */}
                <iframe
                  ref={iframe2Ref}
                  src={reportsData.latestReport.url}
                  title="Relatório Mais Recente"
                  className={styles.iframe}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </ScrollSyncNode>
          </div>
        </div>
      </ScrollSync>
    </div>
  );
};

export const CompanyReportDiff = React.memo(MemoizedCompanyReportDiff);
