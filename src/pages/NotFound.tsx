import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1a2e]">
      <div className="text-center px-6">
        <p className="text-garden-blue text-[0.75rem] font-bold uppercase tracking-[0.2em] mb-4">Erreur 404</p>
        <h1 className="text-[clamp(5rem,15vw,10rem)] font-black text-white leading-none tracking-tighter mb-4">404</h1>
        <p className="text-lg text-white/60 mb-8">Cette page n'existe pas.</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-semibold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
