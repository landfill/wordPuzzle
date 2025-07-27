// Supabase 클라이언트 유틸리티

export function createSupabaseClient(env) {
  // Worker 환경에서는 직접 fetch를 사용
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase configuration missing: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
  }

  return {
    url: supabaseUrl,
    key: supabaseKey,
    
    async query(sql, params = []) {
      // Supabase REST API 사용
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql, params })
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.statusText}`);
      }
      
      return response.json();
    },

    async insert(table, data) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Supabase insert failed: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      
      return response.json();
    },

    async select(table, query = '') {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase select failed: ${response.statusText}`);
      }
      
      return response.json();
    },

    async update(table, data, query = '') {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Supabase update failed: ${response.statusText}`);
      }
      
      return response.json();
    }
  };
}