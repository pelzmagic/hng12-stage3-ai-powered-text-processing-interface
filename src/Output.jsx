import PropTypes from "prop-types";

export default function Output({ messages, translator, setMessages, selectedLang, setSelectedLang, languageDetector }) {
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

      const validDetections = detectedLanguages?.filter((lang) => lang?.detectedLanguage && lang?.confidence >= 0.05) || [];
      console.log("🛠 Valid detections (after filtering):", validDetections);

      if (validDetections.length === 0) {
        console.warn("⚠️ No valid language detected.");
        return;
      }

      const detectedLang = validDetections[0];

      const detectedLanguageCode = detectedLang.detectedLanguage ?? "Unknown";
      const confidenceScore = detectedLang.confidence ?? 0;

      console.log(`✅ Final Detection: ${detectedLanguageCode} (Confidence: ${confidenceScore})`);

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
                  setSelectedLang(e.target.value);
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
