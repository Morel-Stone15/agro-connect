import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// REMPLACEZ CES VALEURS PAR CELLES DE VOTRE PROJET SUPABASE
// 1. Allez sur https://supabase.com/dashboard/project/_/settings/api
// 2. Copiez l'URL du projet et la clé 'anon' / 'public'
const supabaseUrl = 'https://lmrhyakjyhuynxncnaed.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtcmh5YWtqeWh1eW54bmNuYWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjU1OTMsImV4cCI6MjA5MTYwMTU5M30.IB7V2pqU_Vmyz6vugepP_CwWrF-N3-xAVL2qgkcWJkw';

// On exporte le client seulement s'il est configuré pour éviter les erreurs graves
export const supabase = (supabaseUrl && supabaseUrl.includes('supabase.co'))
    ? createClient(supabaseUrl, supabaseKey)
    : null;

if (!supabase) {
    console.warn("⚠️ Supabase n'est pas configuré. Veuillez ajouter vos clés dans js/supabaseClient.js.");
}
