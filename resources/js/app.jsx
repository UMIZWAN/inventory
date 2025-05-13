import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { AssetMetaProvider } from './context/AssetsContext';
import { SuppliersProvider } from './context/SuppliersContext';
import React, { Suspense } from 'react';
import { OptionProvider } from './context/OptionContext';

// Simple spinner component
const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);

// Wrap the App in Suspense to show a fallback while the page is loading
createInertiaApp({
  resolve: name => {
    // Use dynamic import with a promise for lazy loading
    const page = import.meta.glob('./Pages/**/*.jsx');

    // Ensure the import is wrapped as a promise
    return React.lazy(() => page[`./Pages/${name}.jsx`]());
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider>
        <AssetMetaProvider>
          <SuppliersProvider>
            <OptionProvider>
              <Suspense fallback={<Spinner />}>
                <App {...props} />
              </Suspense>
            </OptionProvider>
          </SuppliersProvider>
        </AssetMetaProvider>
      </AuthProvider>
    );
  },
});
