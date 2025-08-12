import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Welcome from "./pages/Welcome";
import RequireAuth from "./components/RequireAuth";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<RequireAuth />}>
          <Route path="/welcome" element={<Welcome />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  );
}

export default App
