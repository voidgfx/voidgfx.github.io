import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://bqclfxdhxvswgmvdvtok.supabase.co";
export const SUPABASE_KEY = "sb_secret_5WAe2N_9iR7Iq7W4LpYYeg_3Tziq-Ge";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// پسوندهای مجاز
export const ALLOWED_EXTENSIONS = [
    'zip', 'rar', '7z', 'png', 'jpg', 'jpeg', 'gif', 'webp', 
    'psd', 'blend', 'fbx', 'obj', 'mp4', 'mp3', 'pdf', 'txt'
];

// حداکثر حجم فایل (10 مگابایت)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// حداکثر حجم عکس پیش‌نمایش (5 مگابایت)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
