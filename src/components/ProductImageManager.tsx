
import { useState, useEffect } from "react";
import { uploadFile, getFileUrl, deleteFile, listFiles } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, X } from "lucide-react";
import { auditService } from "@/services/auditService";

interface ProductImageManagerProps {
  userId: string;
  productId: string;
  initialImageKey?: string; // optional: initial image path in product-images bucket
  onChange?: (imageKey: string | null) => void; // inform parent of image key change
}

const ProductImageManager = ({
  userId,
  productId,
  initialImageKey,
  onChange
}: ProductImageManagerProps) => {
  const [imageKey, setImageKey] = useState<string | null>(initialImageKey || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preview if imageKey changes
  useEffect(() => {
    if (imageKey) {
      getFileUrl("product-images", imageKey)
        .then(url => setPreviewUrl(url))
        .catch(() => setPreviewUrl(null));
    } else {
      setPreviewUrl(null);
    }
  }, [imageKey]);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true); setError(null);
    try {
      const file = e.target.files[0];
      // Save image under userId/productId/
      const { path, publicUrl } = await uploadFile({
        file,
        userId,
        bucket: "product-images",
        extraPath: `products/${productId}/`
      });
      setImageKey(path);
      if (onChange) onChange(path);
      // Audit
      await auditService.logProductUpdate(productId, {}, { image_path: path });
    } catch (err: any) {
      setError("Failed to upload image.");
      console.error("Product image upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!imageKey) return;
    try {
      await deleteFile("product-images", imageKey);
      setImageKey(null);
      setPreviewUrl(null);
      if (onChange) onChange(null);
      await auditService.logProductUpdate(productId, { image_path: imageKey }, {});
    } catch (err) {
      setError("Failed to remove image.");
      console.error("Failed to remove product image", err);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-medium mb-1 block">Product Image</label>
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Product"
            className="h-28 w-28 object-cover rounded border"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-0 right-0 bg-white"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Image className="h-7 w-7 text-gray-400" />
          <span className="text-xs text-gray-500">No image uploaded</span>
        </div>
      )}
      <Input
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={handleSelect}
        className="block w-full"
      />
      {isUploading && (
        <div className="text-blue-500 text-xs">Uploading...</div>
      )}
      {error && (
        <div className="text-red-500 text-xs">{error}</div>
      )}
    </div>
  );
};

export default ProductImageManager;
