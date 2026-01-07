import { exportKakeiboDump, importKakeiboDump, type LocalDump } from "./cloudSync";

export const BACKUP_SCHEMA_VERSION = 1;

export type LocalBackup = {
  schema_version: number;
  exported_at: string;
  app_version?: string;
  data: LocalDump;
};

export function createLocalBackup(options?: {
  appVersion?: string;
  includeSettings?: boolean;
}): LocalBackup {
  const data = exportKakeiboDump({
    includeSettings: options?.includeSettings ?? true,
  });

  return {
    schema_version: BACKUP_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    app_version: options?.appVersion,
    data,
  };
}

export function parseLocalBackup(raw: string):
  | { ok: true; backup: LocalBackup }
  | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as Partial<LocalBackup> | null;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "バックアップ形式が正しくありません。" };
    }
    if (typeof parsed.schema_version !== "number") {
      return { ok: false, error: "バックアップ形式が正しくありません。" };
    }
    if (parsed.schema_version !== BACKUP_SCHEMA_VERSION) {
      return {
        ok: false,
        error:
          "バックアップのバージョンが対応外です。新しい形式で作成し直してください。",
      };
    }
    if (!parsed.data || typeof parsed.data !== "object") {
      return { ok: false, error: "バックアップデータが空です。" };
    }

    return { ok: true, backup: parsed as LocalBackup };
  } catch {
    return { ok: false, error: "JSONの読み込みに失敗しました。" };
  }
}

export function restoreLocalBackup(
  backup: LocalBackup,
  options?: { includeSettings?: boolean; clearBefore?: boolean }
) {
  importKakeiboDump(backup.data, {
    includeSettings: options?.includeSettings ?? true,
    clearBefore: options?.clearBefore ?? true,
  });
}
