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
            // 1. Mendaftar di Supabase Auth
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) throw authError;

            // 2. Jika berhasil, masukkan namaLengkap ke tabel 'profiles'
            if (authData.user) {
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert([
                        { 
                            id: authData.user.id, 
                            namalengkap: namalengkap 
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

    /**
     * Masuk menggunakan email dan password.
     */
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

    // Tambahkan metode ini di dalam class AuthService di authService.js
async signInWithGoogle() {
    try {
        const supabaseClient = await this.getSupabase();
            
            // Trik agar URL redirect menyesuaikan folder secara otomatis
            const currentUrl = window.location.href;
            const targetUrl = currentUrl.replace('login.html', 'dashboard.html');

            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: targetUrl // Sekarang URL-nya tidak akan nyasar!
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error Google Login:', error.message);
            return { data: null, error: error.message };
        }
}

    async signOut() {
        try {
            const supabaseClient = await this.getSupabase();
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            
            return { error: null };
        } catch (error) {
            console.error('Error saat signOut:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Mendapatkan sesi pengguna saat ini.
     */
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

            const supabaseClient = await this.getSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id);
            
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
