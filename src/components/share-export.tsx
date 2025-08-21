import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Download, Upload, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppState } from "@/types";
import { createShareableLink, exportToJson, importFromJson } from "@/lib/storage";

interface ShareExportProps {
  appState: AppState;
  onImportData: (data: AppState) => void;
}

export function ShareExport({ appState, onImportData }: ShareExportProps) {
  const { t } = useTranslation();
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateLink = () => {
    const link = createShareableLink(appState);
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackError) {
          console.error("Failed to copy to clipboard:", fallbackError);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleExportJson = () => {
    exportToJson(appState);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await importFromJson(file);
      onImportData(importedData);
    } catch (error) {
      console.error("Import failed:", error);
      // You might want to show a toast notification here
    } finally {
      setImporting(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const hasData = appState.players.length > 0 || appState.constraints.length > 0 || appState.teams.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          {t("shareExport.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Share Link Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t("shareExport.shareLink")}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("shareExport.shareDescription")}
            </p>
          </div>
          
          <Button
            onClick={handleGenerateLink}
            disabled={!hasData}
            className="w-full sm:w-auto"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {t("shareExport.generateShareLink")}
          </Button>
          
          {shareLink && (
            <div className="space-y-2">
              <Label htmlFor="shareUrl">Share URL</Label>
              <div className="flex gap-2">
                <Input
                  id="shareUrl"
                  value={shareLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 font-medium">
                  {t("common.copied")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Export/Import Section */}
        <div className="space-y-4 border-t pt-6">
          <div>
            <h3 className="font-semibold mb-2">{t("shareExport.exportImportData")}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("shareExport.exportDescription")}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleExportJson}
              disabled={!hasData}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("shareExport.exportJson")}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={importing}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? t("common.loading") : t("shareExport.importJson")}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {!hasData && (
          <div className="text-center text-muted-foreground py-4 text-sm">
            Add players, constraints, or generate teams to enable sharing and export
          </div>
        )}
      </CardContent>
    </Card>
  );
}
