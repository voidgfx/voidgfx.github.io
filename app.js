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
// مدیریت وضعیت لاگین در هدر
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
// بررسی لاگین بودن کاربر (برای صفحات محافظت‌شده)
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
// خروج از حساب
// =========================
export async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// =========================
// اجرای خودکار در همه صفحات
// =========================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
