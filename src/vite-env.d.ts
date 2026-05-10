/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SMMO_API_BASE_URL: string;
  readonly VITE_ENABLE_REAL_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
