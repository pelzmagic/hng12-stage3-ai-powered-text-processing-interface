import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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
      selectedLang: "en", // Store language for each message
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

function Header() {
  return (
    <h1 className="text-center mt-8 text-2xl font-bold font-montserrat text-slate-800">
      <i>AI-text processor</i>
    </h1>
  );
}

// eslint-disable-next-line react/prop-types
function TextArea({ text, setText, onSend }) {
  return (
    <div className="w-[90%] mx-auto absolute bottom-[5%] left-1/2 -translate-x-1/2 flex justify-between items-center">
      <textarea
        placeholder="Tell me your mind?"
        className="border border-slate-700 outline-none focus:border-amber-400 focus:ring rounded-lg w-[90%] focus:ring-amber-100 p-1"
        value={text}
        onChange={(e) => setText(e.target.value)}></textarea>
      <div onClick={onSend}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </div>
    </div>
  );
}

function Output({ messages, translator, setMessages, selectedLang, setSelectedLang, languageDetector }) {
  const handleTranslate = async (messageId, text, lang) => {
    if (!translator) {
      console.error("Translator not initialized");
      return;
    }

    try {
      console.log(`🔄 Translating: "${text}" to ${lang}`);

      const result = await translator.translate(text);

      console.log("🚀 Full Translation Response:", result);

      let translatedText = result?.translatedText || result || "Translation failed";

      console.log("✅ Translated Text:", translatedText);

      const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, translated: translatedText } : msg));

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const handleDetectLanguage = async (messageId, text) => {
    if (!languageDetector) {
      console.error("❌ Language Detector not initialized");
      return;
    }

    try {
      console.log(`🔍 Detecting language for: "${text}"`);

      const detectedLanguages = await languageDetector.detect(text);
      console.log("✅ Full Detected Language Response:", detectedLanguages);

      if (!Array.isArray(detectedLanguages) || detectedLanguages.length === 0) {
        console.warn("⚠️ No language detected.");
        return;
      }

      // 🛠 Ensure validDetections is always an array
      const validDetections = detectedLanguages?.filter((lang) => lang?.detectedLanguage && lang?.confidence >= 0.05) || [];
      console.log("🛠 Valid detections (after filtering):", validDetections);

      if (validDetections.length === 0) {
        console.warn("⚠️ No valid language detected.");
        return;
      }

      // 🏆 Get the highest confidence detection
      const detectedLang = validDetections[0];

      const detectedLanguageCode = detectedLang.detectedLanguage ?? "Unknown";
      const confidenceScore = detectedLang.confidence ?? 0;

      console.log(`✅ Final Detection: ${detectedLanguageCode} (Confidence: ${confidenceScore})`);

      // 📝 Update message state
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              detectedLang: {
                language: detectedLanguageCode,
                confidence: confidenceScore,
              },
            }
          : msg
      );

      setMessages(updatedMessages);
    } catch (error) {
      console.error("🚨 Language detection error:", error);
    }
  };

  return (
    <div className="text-black  w-[90%] mx-auto absolute top-[15%] left-1/2 -translate-x-1/2 p-2 break-words max-h-[350px] overflow-auto">
      {messages.map((message) => (
        <div key={message.id}>
          <p>{message.content}</p>
          {message.translated && <p className="text-blue-500">Translated: {message.translated}</p>}
          {message.detectedLang && (
            <p className="text-red-500">
              Detected Language: {message.detectedLang.language && message.detectedLang.language !== "Unknown" ? message.detectedLang.language : "Could not detect"}
              {message.detectedLang.confidence !== undefined && ` (Confidence: ${message.detectedLang.confidence.toFixed(2)})`}
            </p>
          )}

          <div className="mt-2 space-x-2  flex flex-col gap-2">
            <div className="flex justify-between">
              {message.content.length >= 150 && <button className="bg-green-500 text-white px-1 py-1 rounded">Summarize</button>}
              <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleDetectLanguage(message.id, message.content)}>
                Detect Language
              </button>
            </div>
            <div className="flex justify-between">
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value); // ✅ Now using setSelectedLang
                  const updatedMessages = messages.map((msg) => (msg.id === message.id ? { ...msg, selectedLang: e.target.value } : msg));
                  setMessages(updatedMessages);
                }}
                className="bg-green-500 text-white px-1 py-1 rounded outline-none">
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>

              <button className="bg-green-500 text-white px-1 py-1 rounded" onClick={() => handleTranslate(message.id, message.content, message.selectedLang || selectedLang)}>
                Translate
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
Output.propTypes = {
  messages: PropTypes.array.isRequired,
  translator: PropTypes.object,
  setMessages: PropTypes.func.isRequired,
  selectedLang: PropTypes.string,
  setSelectedLang: PropTypes.func,
  languageDetector: PropTypes.object,
};

export default App;
