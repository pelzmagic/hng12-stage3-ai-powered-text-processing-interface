import { useState, useEffect } from "react";
import Header from "./Header";
import TextArea from "./TextArea";
import Output from "./Output";

function App() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [translator, setTranslator] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en");
  const [languageDetector, setLanguageDetector] = useState(null);

  useEffect(() => {
    async function loadLanguageDetector() {
      if (!("ai" in window) || !window.ai?.languageDetector?.create) {
        console.error("❌ Chrome AI APIs not available. Enable experimental features in Chrome.");
        return;
      }

      try {
        const detectorInstance = await window.ai.languageDetector.create();
        console.log("✅ Language Detector initialized:", detectorInstance);
        setLanguageDetector(detectorInstance);
      } catch (error) {
        console.error("🚨 Error initializing Language Detector:", error);
      }
    }

    loadLanguageDetector();
  }, []);

  useEffect(() => {
    async function loadTranslator() {
      if (!("ai" in window) || !window.ai?.translator?.create) {
        console.error("❌ Chrome AI APIs not available. Enable experimental features in Chrome.");
        return;
      }

      try {
        if (selectedLang === "en") {
          setTranslator(null);
          return;
        }

        console.log(`Initializing translator from "auto" to "${selectedLang}"`);

        const translatorInstance = await window.ai.translator.create({
          sourceLanguage: "en",
          targetLanguage: selectedLang,
        });

        console.log("✅ Translator initialized:", translatorInstance);
        setTranslator(translatorInstance);
      } catch (error) {
        console.error("🚨 Error initializing translator:", error);
        setTranslator(null);
      }
    }

    loadTranslator();
  }, [selectedLang]);

  const handleSend = function () {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: text,
      translated: null,
      selectedLang: "en",
    };

    setMessages([...messages, newMessage]);
    setText("");
  };

  return (
    <div>
      <Header />
      <Output messages={messages} translator={translator} setMessages={setMessages} selectedLang={selectedLang} setSelectedLang={setSelectedLang} languageDetector={languageDetector} />
      <TextArea text={text} setText={setText} onSend={handleSend} />
    </div>
  );
}

export default App;
