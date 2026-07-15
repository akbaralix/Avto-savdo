const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "cars";

/**
 * Uploads a file to Supabase Storage bucket and returns its public URL.
 * Falls back to base64 data URL for instant offline testing if env is not configured.
 *
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageToSupabase(file) {
  // Check if credentials are set
  const isConfigured =
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== "https://your-project-id.supabase.co" &&
    SUPABASE_ANON_KEY !== "your-anon-public-key";

  if (!isConfigured) {
    console.warn(
      "Supabase credentials not configured in .env. Falling back to local preview URL for testing.",
    );
    // Fallback: Return a local blob URL or base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 representation of the file
      };
      reader.readAsDataURL(file);
    });
  }

  // Generate a unique filename to prevent collisions
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  // URL endpoint for object uploading
  // Format: https://[project-id].supabase.co/storage/v1/object/[bucket]/[path]
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${fileName}`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Supabase upload failed: ${response.statusText}. Details: ${errText}`,
      );
    }

    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
}
