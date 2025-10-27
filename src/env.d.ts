interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: 'development' | 'production' | string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
