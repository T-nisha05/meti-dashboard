// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://hufobzpbupxworfslkit.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Zm9ienBidXB4d29yZnNsa2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQzMTIsImV4cCI6MjA4MTE5MDMxMn0.dGPTzvQJ2tVTsfNpODKg_N5-emfBCMpfeFiIjMxSPBU"
)

export default supabase;
