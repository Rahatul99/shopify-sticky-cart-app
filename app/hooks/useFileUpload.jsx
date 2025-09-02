import { useCallback, useState } from "react";

export const useFileUpload = (setFormSettings, setUploadedFile) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("icon", file);

        const response = await fetch("/api/upload-icon", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setFormSettings((prev) => ({
            ...prev,
            selectedIcon: "custom",
            uploadedIconData: result.iconData,
            uploadedIconType: result.iconType,
          }));
          setUploadedFile(file);
        } else {
          setUploadError(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [setFormSettings, setUploadedFile],
  );

  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleRemoveIcon = useCallback(() => {
    setFormSettings((prev) => ({
      ...prev,
      uploadedIconData: null,
      uploadedIconType: null,
      selectedIcon: "cart",
    }));
    setUploadedFile(null);
    setUploadError(null);
  }, [setFormSettings, setUploadedFile]);

  return {
    isUploading,
    uploadError,
    handleFileSelect,
    handleRemoveIcon,
  };
};
