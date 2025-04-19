import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { AssetMetaProvider } from './context/AssetsContext';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider>
        <AssetMetaProvider>
          <App {...props} />
        </AssetMetaProvider>
      </AuthProvider>
    )
  },
})
