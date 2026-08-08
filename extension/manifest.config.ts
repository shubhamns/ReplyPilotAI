import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'ReplyPilot AI',
  description: 'AI writing assistant — fix grammar, rewrite, translate, and reply from any website.',
  version: '1.1.0',
  icons: {
    '16': 'public/icons/icon16.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '48': 'public/icons/icon48.png',
      '128': 'public/icons/icon128.png',
    },
    default_title: 'ReplyPilot AI',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage', 'activeTab', 'contextMenus', 'scripting', 'clipboardWrite'],
  host_permissions: [
    'http://127.0.0.1:8000/*',
    'http://localhost:8000/*',
  ],
  optional_host_permissions: [
    'http://*/*',
    'https://*/*',
  ],
  web_accessible_resources: [
    {
      resources: ['src/panel/index.html', 'assets/*'],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
})
