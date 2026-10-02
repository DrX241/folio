import documents from './cms-documents.json' with { type: 'json' };
import { defaultSettings } from './cms-schema.mjs';
export function defaultCms() { return structuredClone({ settings: defaultSettings, documents }); }
