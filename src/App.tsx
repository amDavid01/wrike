/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { Main } from "./pages/Main";

import "flatpickr/dist/themes/light.css";
import "simplebar/dist/simplebar.min.css";
import "tippy.js/dist/tippy.css";

import { LoadingSpinner } from "@deskpro/app-sdk";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import { Suspense } from "react";
import { Redirect } from "./components/Redirect/Redirect";
import { CreateNote } from "./pages/Create/Note";
import { FindOrCreate } from "./pages/FindOrCreate/FindOrCreate";
import { ViewTask } from "./pages/View/Task";
import { query } from "./utils/query";
import { EditTask } from "./pages/Edit/Task";

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={query}>
        <Suspense fallback={<LoadingSpinner />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                <Routes>
                  <Route path="/">
                    <Route path="create">
                      <Route path="note/:taskId" element={<CreateNote />} />
                    </Route>
                    <Route path="edit">
                      <Route path="task/:taskId" element={<EditTask />} />
                    </Route>
                    <Route path="/findOrCreate" element={<FindOrCreate />} />
                    <Route path="/redirect" element={<Redirect />} />
                    <Route index element={<Main />} />
                    <Route path="view">
                      <Route path="task/:taskId" element={<ViewTask />} />
                    </Route>
                  </Route>
                </Routes>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
