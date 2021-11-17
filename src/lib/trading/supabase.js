import { createClient } from '@supabase/supabase-js';
import { readable } from 'svelte/store';

const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_SUPABASE_URL;

export const supabase = createClient(apiUrl, apiKey);

export const user = readable(supabase.auth.user(), (set) => {
	supabase.auth.onAuthStateChange((event, session) => {
		if (event == 'SIGNED_OUT') {
			set(null);
		}
	});
});

export const auth = supabase.auth;
