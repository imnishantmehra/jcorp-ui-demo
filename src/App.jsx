import jcorpLogo from "/assets/jcorp-logo-white.png";
import "./App.css";
import "./index.css";
import Upload from "./components/Upload";

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-6">
        <img src={jcorpLogo} className="h-[60px] w-[175px]" alt="JCorp Logo" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
        JCorp DOCX Converter
      </h1>

      <Upload />
    </div>
  );
}

export default App;
