import { supabase } from "@/integrations/supabase/client";

// Supported buckets
const PRESCRIPTIONS_BUCKET = "prescriptions";
const PRODUCT_IMAGES_BUCKET = "product-images";
const LAB_RESULTS_BUCKET = "lab-results";

export async function uploadFile({
  file,
  userId,
  bucket,
  extraPath = "",
}: {
  file: File;
  userId: string;
  bucket: "prescriptions" | "product-images" | "lab-results";
  extraPath?: string;
}): Promise<{ path: string; publicUrl?: string }> {
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/\s+/g, "_");
  const path = `${userId}/${extraPath}${timestamp}_${safeFileName}`;
  let bucketName = bucket;
  const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  // Create public URL if public bucket
  let publicUrl: string | undefined = undefined;
  if (bucket === "product-images" || bucket === "lab-results") {
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path);
    publicUrl = urlData?.publicUrl;
  }
  return { path, publicUrl };
}

export async function listFiles(userId: string, bucket: "prescriptions" | "product-images" | "lab-results") {
  const { data, error } = await supabase.storage.from(bucket).list(userId + "/");
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucket: "prescriptions" | "product-images" | "lab-results", path: string) {
  if (bucket === "product-images" || bucket === "lab-results") {
    // Public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl;
  } else {
    // Create signed URL, valid 2 hours
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 120);
    if (error) throw error;
    return data.signedUrl;
  }
}

export async function deleteFile(bucket: "prescriptions" | "product-images" | "lab-results", path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

