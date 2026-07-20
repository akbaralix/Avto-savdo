import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = 
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY !== "your-anon-public-key") 
    ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
    : import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "cars";

// Check if credentials are set
const isConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== "https://your-project-id.supabase.co" &&
  SUPABASE_ANON_KEY !== "your-anon-public-key";

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * Uploads a file to Supabase Storage bucket and returns its public URL.
 * Falls back to base64 data URL for instant offline testing if env is not configured.
 *
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageToSupabase(file) {
  if (!isConfigured || !supabase) {
    console.warn(
      "Supabase credentials not configured in .env. Falling back to local preview URL for testing.",
    );
    // Fallback: Return a local base64 representation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Generate a unique filename to prevent collisions
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
}

