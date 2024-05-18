const supabase = require('@supabase/supabase-js')
const config = require('../configs/config')

const supabaseClient = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

module.exports =  supabaseClient;