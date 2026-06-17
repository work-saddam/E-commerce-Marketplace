import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "./store/store";
import AppRoutes from "./router/AppRoutes";
import ErrorBoundary from "../shared/components/feedback/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <AppRoutes />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
