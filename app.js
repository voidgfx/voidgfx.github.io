import { supabase } from './config.js';

// =========================
// توابع کمکی
// =========================
export function formatNumber(value) {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
}

export function escapeHTML(value) {
    if (!value) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================
// بررسی لاگین بودن کاربر
// =========================
export async function requireAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'auth.html';
        return null;
    }
    return user;
}

// =========================
// به‌روزرسانی دکمه ورود/پروفایل
// =========================
export async function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        authBtn.textContent = 'پروفایل من';
        authBtn.href = 'profile.html';
    } else {
        authBtn.textContent = 'ورود / ثبت‌نام';
        authBtn.href = 'auth.html';
    }
}

// =========================
// خروج
// =========================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });
    }
});
