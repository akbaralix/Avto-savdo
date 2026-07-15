import "./App.css";
import Navbar from "./pages/navbar/navbar.jsx";
import Index from "./components/routes/index.jsx";
import { Toaster, useToasterStore } from "react-hot-toast";
import { useEffect } from "react";

function App() {
  // const { toast } = useToasterStore();

  // useEffect(() => {
  //   toast
  //     .filter((t) => t.visable)
  //     .filter((_, i) => i >= 3)
  //     .forEach((t) => toast.dismiss(t.id));
  // }, [toast]);

  return (
    <div className="App">
      <Navbar />
      <Index />
      <Toaster position="top-center" limit={3} reverseOrder={false} />
    </div>
  );
}

export default App;
