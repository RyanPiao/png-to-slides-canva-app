import { useState, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useFeatureSupport } from "@canva/app-hooks";
import {
  Button,
  FileInput,
  FileInputItem,
  ProgressBar,
  Rows,
  Text,
  Alert,
} from "@canva/app-ui-kit";
import { addPage, getCurrentPageContext } from "@canva/design";
import { upload } from "@canva/asset";
import * as styles from "styles/components.css";

type Status = "idle" | "inserting" | "done" | "error";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addPageWithRetry(
  options: Parameters<typeof addPage>[0],
  maxRetries = 3
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await addPage(options);
      return;
    } catch (err) {
      const isRateLimited =
        err instanceof Error && err.message.toLowerCase().includes("rate");
      if (isRateLimited && attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        await delay(2000 * Math.pow(2, attempt));
      } else {
        throw err;
      }
    }
  }
}

export const App = () => {
  const intl = useIntl();
  const isSupported = useFeatureSupport();
  const canAddPage = isSupported(addPage);

  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      combined.sort((a, b) => a.name.localeCompare(b.name));
      return combined;
    });
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleFileDelete = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleInsert = useCallback(async () => {
    if (files.length === 0) return;

    setStatus("inserting");
    setProgress({ current: 0, total: files.length });
    setErrorMsg("");

    try {
      // Get current page dimensions
      const pageContext = await getCurrentPageContext();
      const pageWidth = pageContext.dimensions?.width ?? 1920;
      const pageHeight = pageContext.dimensions?.height ?? 1080;

      for (let i = 0; i < files.length; i++) {
        setProgress({ current: i + 1, total: files.length });

        const file = files[i]!;
        const dataUrl = await readFileAsDataUrl(file);

        // Get image dimensions to calculate proper sizing
        const imgDims = await getImageDimensions(dataUrl);

        // Scale so height matches page height, center horizontally
        const scale = pageHeight / imgDims.height;
        const scaledWidth = imgDims.width * scale;
        const left = (pageWidth - scaledWidth) / 2;

        // Upload the image
        const asset = await upload({
          type: "image",
          mimeType: "image/png",
          url: dataUrl,
          thumbnailUrl: dataUrl,
          aiDisclosure: "none",
        });

        // Add a new page with the image as a full-page element (with retry)
        await addPageWithRetry({
          elements: [
            {
              type: "image",
              ref: asset.ref,
              altText: { text: file.name, decorative: true },
              top: 0,
              left: Math.round(left),
              width: Math.round(scaledWidth),
              height: pageHeight,
            },
          ],
        });

        // Rate limit: max 3 pages/sec → wait 500ms between pages
        if (i < files.length - 1) {
          await delay(500);
        }
      }

      setStatus("done");
      setFiles([]); // Auto-clear files after successful insert
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }, [files]);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text size="large" variant="bold">
          <FormattedMessage
            id="app.title"
            defaultMessage="PNG to Slides"
            description="App title displayed at the top of the sidebar"
          />
        </Text>
        <Text>
          <FormattedMessage
            id="app.description"
            defaultMessage="Select PNG files to insert as full-page slides. Pages are added after the currently selected page, sorted by filename."
            description="App description explaining how the app works"
          />
        </Text>

        <FileInput
          accept={["image/png"]}
          multiple
          onDropAcceptedFiles={handleFilesAccepted}
        />

        <Button
          variant="primary"
          onClick={handleInsert}
          disabled={files.length === 0 || status === "inserting" || !canAddPage}
          stretch
          tooltipLabel={
            !canAddPage
              ? intl.formatMessage({
                  id: "app.tooltip.unsupported",
                  defaultMessage:
                    "Adding pages is not supported in this design type",
                  description:
                    "Tooltip shown when the design type does not support adding pages",
                })
              : undefined
          }
        >
          {status === "inserting" ? (
            <FormattedMessage
              id="app.button.inserting"
              defaultMessage="Inserting {current}/{total}..."
              description="Button text shown during slide insertion progress"
              values={{ current: progress.current, total: progress.total }}
            />
          ) : (
            <FormattedMessage
              id="app.button.insert"
              defaultMessage="Insert {count} {count, plural, one {Slide} other {Slides}}"
              description="Button text to start inserting selected PNG files as slides"
              values={{ count: files.length }}
            />
          )}
        </Button>

        {status === "inserting" && (
          <Rows spacing="1u">
            <Text size="small">
              <FormattedMessage
                id="app.progress.text"
                defaultMessage="Inserting {current} of {total}..."
                description="Progress text showing how many slides have been inserted"
                values={{ current: progress.current, total: progress.total }}
              />
            </Text>
            <ProgressBar
              size="medium"
              value={(progress.current / progress.total) * 100}
            />
          </Rows>
        )}

        {status === "done" && (
          <Alert tone="positive">
            <FormattedMessage
              id="app.alert.success"
              defaultMessage="Inserted {total} {total, plural, one {slide} other {slides}}"
              description="Success message shown after all slides are inserted"
              values={{ total: progress.total }}
            />
          </Alert>
        )}

        {status === "error" && (
          <Alert tone="critical">
            <FormattedMessage
              id="app.alert.error"
              defaultMessage="Error: {errorMsg}"
              description="Error message shown when slide insertion fails"
              values={{ errorMsg }}
            />
          </Alert>
        )}

        {files.length > 0 && (
          <>
            <Text size="small" variant="bold">
              <FormattedMessage
                id="app.files.count"
                defaultMessage="{count} {count, plural, one {file} other {files}} selected"
                description="Text showing the number of files selected for insertion"
                values={{ count: files.length }}
              />
            </Text>
            {files.map((file, index) => (
              <FileInputItem
                key={`${file.name}-${index}`}
                label={file.name}
                onDeleteClick={() => handleFileDelete(index)}
                disabled={status === "inserting"}
              />
            ))}
            <Button
              variant="secondary"
              onClick={handleClearAll}
              disabled={status === "inserting"}
            >
              <FormattedMessage
                id="app.button.clearAll"
                defaultMessage="Clear all"
                description="Button to remove all selected files from the list"
              />
            </Button>
          </>
        )}
      </Rows>
    </div>
  );
};
