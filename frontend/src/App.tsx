import { Routes, Route } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Insights from "@/pages/Insights";
import Article from "@/pages/Article";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return <SiteShell><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/services" element={<Services />} /><Route path="/insights" element={<Insights />} /><Route path="/insights/:slug" element={<Article />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/privacy" element={<Legal type="privacy" />} /><Route path="/terms" element={<Legal type="terms" />} /><Route path="/compliance" element={<Legal type="compliance" />} /><Route path="*" element={<NotFound />} /></Routes></SiteShell>;
}
