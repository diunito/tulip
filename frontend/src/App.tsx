import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import "./App.css";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { FlowList } from "./components/FlowList";
import { FlowView } from "./pages/FlowView";
import { DiffView } from "./pages/DiffView";
import { Corrie } from "./components/Corrie";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Settings } from "./types";
import { CompressedFlowList } from "./components/CompressedFlowList";
import { useSelector } from "react-redux";
import { TulipRootState } from "./store";

function App() {
  useHotkeys("esc", () => (document.activeElement as HTMLElement).blur(), {
    enableOnFormTags: true,
  });

  const compressedLayout = useSelector((state: TulipRootState) => state.settings.compressedLayout);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="flow/:id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                {compressedLayout ? <CompressedFlowList /> : <FlowView />}
              </Suspense>
            }
          />
          <Route
            path="diff/:id"
            element={
              <Suspense>
                <DiffView />
              </Suspense>
            }
          />
          <Route
            path="corrie/"
            element={
              <Suspense>
                <Corrie />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function Layout() {
  return (
    <div className="grid-container">
      <div className="ModalHere"></div>
      <header className="header-area">
        <div className="header max-w-full">
          <Header></Header>
        </div>
      </header>
      <aside className="flow-list-area">
        <Suspense>
          <FlowList></FlowList>
        </Suspense>
      </aside>
      <main className="flow-details-area">
        <Outlet />
      </main>
      <footer className="footer-area"></footer>
    </div>
  );
}

function PageNotFound() {
  return (
    <div>
      <h2>404 Page not found</h2>
    </div>
  );
}

export default App;
