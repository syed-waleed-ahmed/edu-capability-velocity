"use client";

import type { DriveStudyPackage } from "@/schemas/drive-study-package";
import type { StudyPackage } from "@/schemas/study-package";
import { StudyPackageCard } from "../StudyPackageCard";
import styles from "./DriveStudyPackageCard.module.css";

interface DriveStudyPackageCardProps {
  data: DriveStudyPackage;
}

function toStudyPackage(data: DriveStudyPackage): StudyPackage {
  return {
    type: "study-package",
    title: data.title,
    subject: data.subject,
    difficulty: data.difficulty,
    keyConcepts: data.keyConcepts,
    sections: data.sections,
    suggestedReadingOrder: data.suggestedReadingOrder,
    totalReadingTimeMinutes: data.totalReadingTimeMinutes,
  };
}

export function DriveStudyPackageCard({ data }: DriveStudyPackageCardProps) {
  const previewFiles = data.source.files.slice(0, 5);
  const hiddenCount = Math.max(0, data.source.files.length - previewFiles.length);

  return (
    <div className={styles.wrapper}>
      <section className={styles.sourcePanel}>
        <span className={styles.badge}>Google Drive Import</span>
        <h3 className={styles.title}>Google Drive Source</h3>
        <p className={styles.meta}>
          {data.source.fileCount} files imported
          {data.source.folderId ? ` from folder ${data.source.folderId}` : ""}
        </p>

        <div className={styles.fileList}>
          {previewFiles.map((file) => (
            <div key={file.id} className={styles.fileRow}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMime}>{file.mimeType}</span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <div className={styles.moreFiles}>+{hiddenCount} more files</div>
          )}
        </div>
      </section>

      <StudyPackageCard data={toStudyPackage(data)} />
    </div>
  );
}
