class AuthService {
    constructor() {
        this.supabase = null;
    }

    async getSupabase() {
        if (!this.supabase) {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
            this.supabase = createClient('https://aqrbqoaicqzwehzuxckf.supabase.co', 'sb_publishable_HZfl7aJTc5Ex1fmV-ktN8Q_7XRwxnx5');
        }
        return this.supabase;
    }

    async signUp(email, password, namalengkap) {
        try {
            const supabaseClient = await this.getSupabase();
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) throw authError;

            if (authData.user) {
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .upsert([
                        {
                            id: authData.user.id,
                            namalengkap: namalengkap,
                            email: email
                        }
                    ]);

                if (profileError) {
                    console.error('Gagal memasukkan data ke profiles:', profileError.message);
                    throw profileError;
                }
            }

            return { data: authData, error: null };
        } catch (error) {
            console.error('Error saat signUp:', error.message);
            return { data: null, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Error saat signIn:', error.message);
            return { data: null, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            const supabaseClient = await this.getSupabase();
            const isApp = typeof window.Capacitor !== 'undefined';

            if (isApp) {
                const { GoogleAuth } = window.Capacitor.Plugins;
                GoogleAuth.initialize({
                    clientId: '270935693328-evftqpnn7e3nmqv5v791c31ojqntalnd.apps.googleusercontent.com',
                    scopes: ['profile', 'email'],
                    grantOfflineAccess: true,
                });
                const googleUser = await GoogleAuth.signIn();

                // 2. Ambil ID Token hasil login dari HP
                const idToken = googleUser.authentication.idToken;

                if (!idToken) throw new Error("Gagal mendapatkan ID Token dari Google.");

                // 3. Kirim ID Token tersebut ke Supabase secara instan
                const { data, error } = await supabaseClient.auth.signInWithIdToken({
                    provider: 'google',
                    token: idToken
                });

                if (error) throw error;
                return { data, error: null };

            }
        } catch (error) {
            console.error('Error Google Login:', error.message);
            return { data: null, error: error.message };
        }
    }

    async signOut() {
        try {
            const supabaseClient = await this.getSupabase();
            const isApp = typeof window.Capacitor !== 'undefined';

            // 1. Jika di aplikasi Android, hapus juga ingatan akun Google-nya
            if (isApp) {
                const { GoogleAuth } = window.Capacitor.Plugins;
                // Pastikan inisialisasi dipanggil sebelum memanggil signOut
                GoogleAuth.initialize({
                    clientId: '270935693328-evftqpnn7e3nmqv5v791c31ojqntalnd.apps.googleusercontent.com',
                    scopes: ['profile', 'email'],
                    grantOfflineAccess: true,
                });

                // Perintah untuk "melupakan" akun Google yang nyangkut
                await GoogleAuth.signOut();
            }

            // 2. Hapus sesi di Supabase
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;

            return { error: null };
        } catch (error) {
            console.error('Error saat Sign Out:', error.message);
            return { error: error.message };
        }
    }

    async getSession() {
        try {
            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient.auth.getSession();

            if (error) throw error;

            return { session: data.session, error: null };
        } catch (error) {
            console.error('Error saat getSession:', error.message);
            return { session: null, error: error.message };
        }
    }

    async getProfile() {
        try {
            const { session, error: sessionError } = await this.getSession();
            if (sessionError || !session) return { data: null, error: sessionError || 'No session' };

            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            return { data, error };
        } catch (error) {
            console.error('Error saat getProfile:', error.message);
            return { data: null, error: error.message };
        }
    }

    async updateProfile(updates) {
        try {
            const { session, error: sessionError } = await this.getSession();
            if (sessionError || !session) return { data: null, error: sessionError || 'No session' };

            updates.id = session.user.id;

            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .upsert(updates);

            return { data, error };
        } catch (error) {
            console.error('Error saat updateProfile:', error.message);
            return { data: null, error: error.message };
        }
    }

    async addTask(taskData) {
        try {
            const { session, error: sessionError } = await this.getSession();
            if (sessionError || !session) return { data: null, error: sessionError || 'No session' };

            taskData.user_id = session.user.id;
            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient
                .from('kegiatan')
                .insert([taskData]);

            return { data, error };
        } catch (error) {
            console.error('Error saat addTask:', error.message);
            return { data: null, error: error.message };
        }
    }

    async updateTask(taskId, updates) {
        try {
            const { session, error: sessionError } = await this.getSession();
            if (sessionError || !session) return { data: null, error: sessionError || 'No session' };

            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient
                .from('kegiatan')
                .update(updates)
                .eq('id', taskId)
                .eq('user_id', session.user.id);

            return { data, error };
        } catch (error) {
            console.error('Error saat updateTask:', error.message);
            return { data: null, error: error.message };
        }
    }
}

window.authService = new AuthService();

window.showCustomModal = function (options) {
    if (window._isModalActive) return Promise.resolve(false);
    window._isModalActive = true;

    return new Promise((resolve) => {
        const { title, message, type = 'confirm', confirmText = 'Ya', cancelText = 'Batal' } = options;

        let icon = 'fa-circle-question';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-circle-xmark';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 360px;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            transform: scale(0.95) translateY(15px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center; font-family: 'Inter', sans-serif;
        `;

        const iconColor = type === 'confirm' ? 'var(--primary-dark)' : (type === 'success' ? '#10b981' : '#ef4444');
        const iconBg = type === 'confirm' ? '#e8f5e9' : (type === 'success' ? '#d1fae5' : '#fee2e2');

        modal.innerHTML = `
            <div style="width: 56px; height: 56px; border-radius: 50%; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px;">
                <i class="fa-solid ${icon}"></i>
            </div>
            <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1e293b;">${title}</h3>
            <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                ${type === 'confirm' ? `<button id="modal-cancel" style="flex: 1; padding: 10px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #475569; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s;">${cancelText}</button>` : ''}
                <button id="modal-confirm" style="flex: 1; padding: 10px 16px; border-radius: 8px; border: none; background: ${iconColor}; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s;">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        });

        const close = (result) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.95) translateY(15px)';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                window._isModalActive = false;
                resolve(result);
            }, 300);
        };

        document.getElementById('modal-confirm').addEventListener('click', () => close(true));
        if (type === 'confirm') {
            document.getElementById('modal-cancel').addEventListener('click', () => close(false));
            document.getElementById('modal-cancel').addEventListener('mouseover', function () { this.style.background = '#f1f5f9'; });
            document.getElementById('modal-cancel').addEventListener('mouseout', function () { this.style.background = 'white'; });
        }
        document.getElementById('modal-confirm').addEventListener('mouseover', function () { this.style.opacity = '0.9'; });
        document.getElementById('modal-confirm').addEventListener('mouseout', function () { this.style.opacity = '1'; });
    });
};

// Global Auth Guard
(async function() {
    const path = window.location.pathname;
    const isPublicPage = path.endsWith('index.html') || path.endsWith('login.html') || path.endsWith('register.html') || path.endsWith('/') || path.includes('lupa-password');
    
    try {
        const { session } = await window.authService.getSession();
        
        if (session && isPublicPage) {
            window.location.replace('dashboard.html');
        } else if (!session && !isPublicPage) {
            window.location.replace('login.html');
        } else {
            // Munculkan UI secara perlahan setelah dipastikan halaman ini benar
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
    } catch (err) {
        console.error("Auth Guard Error:", err);
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }
})();
