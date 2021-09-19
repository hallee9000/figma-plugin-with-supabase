import {PostgrestClient} from '@supabase/postgrest-js';
import {SupabaseStorageClient} from '@supabase/storage-js';

export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;

const authUri = '/auth/v1';

class SupabaseClient {
  apiUrl: string;
  apikey: string;
  headers: {[key: string]: string};
  auth: any;
  postgrest: any;
  storage: any;

  /**
   * @param apiUrl  supabase api url.
   * @param apikey  supabase key.
   */
  constructor(apiUrl: string, apikey: string) {
    this.apiUrl = apiUrl;
    this.apikey = apikey;
    this.headers = this._getAuthHeaders();
  }

  private _getAuthHeaders(auth?): {[key: string]: string} {
    const headers: {[key: string]: string} = {};
    const authBearer = auth?.access_token ?? SUPABASE_ANON_KEY;
    headers['apikey'] = SUPABASE_ANON_KEY;
    headers['Authorization'] = `Bearer ${authBearer}`;
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  private _initPostgrest() {
    const REST_URL = `${SUPABASE_URL}/rest/v1`;
    const postgrest = new PostgrestClient(REST_URL, {
      schema: 'public',
      headers: this.headers,
    });
    return postgrest;
  }

  private _initStorage() {
    const STORAGE_URL = `${SUPABASE_URL}/storage/v1`;
    const storageHeaders = {...this.headers};
    delete storageHeaders['Content-Type'];
    const storage = new SupabaseStorageClient(STORAGE_URL, storageHeaders);
    return storage;
  }

  private _initializeAuth(auth) {
    this.auth = auth;
    this.headers = this._getAuthHeaders(auth);
    this.postgrest = this._initPostgrest();
    this.storage = this._initStorage();
  }

  private _checkToken(auth) {
    const now = new Date().getTime() / 1000;
    const diff = auth.expires_at - now;
    if (diff > 0) {
      // Almost expired
      if (diff < 20) {
        return 'near';
      }
      return 'safe';
    } else {
      // Expired
      return 'expired';
    }
  }

  async verifyAuth(auth, callback) {
    const tokenState = this._checkToken(auth);
    if (tokenState === 'near') {
      // Refresh token automatically if token is almost expired
      const {data, error} = await this.signIn({
        refresh_token: auth.refresh_token,
      });
      if (error) {
        console.error(data);
      } else {
        // Reset auth data
        this._initializeAuth(data);
        callback(data);
      }
    } else if (tokenState === 'expired') {
      callback();
    } else if (tokenState === 'safe') {
      // Initialize auth data
      this._initializeAuth(auth);
      callback(auth);
    }
  }

  // TODO: signUp
  // async signUp (data) {
  //   const auth = await fetch(this.apiUrl + authUri + '/signup', {
  //     method: 'POST',
  //     headers: this.headers,
  //     body: JSON.stringify(data)
  //   })
  //     .then(res => res.json())

  //   console.log(auth)
  // }

  async signIn(data) {
    const url = `/token?grant_type=${data.email ? 'password' : 'refresh_token'}`;
    const auth = await fetch(this.apiUrl + authUri + url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => res.json());

    if (auth.error) {
      return {data: null, error: auth};
    } else {
      const now = new Date().getTime() / 1000;
      const authData = {...auth, expires_at: Math.floor(now + auth.expires_in)};

      // Logged in, initialize auth data
      this._initializeAuth(authData);
      return {data: authData, error: null};
    }
  }

  getImageUrl(bucket: string, url: string) {
    const {publicURL, error} = this.storage.from(bucket).getPublicUrl(url);
    if (publicURL) {
      return publicURL;
    } else {
      throw error;
    }
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
