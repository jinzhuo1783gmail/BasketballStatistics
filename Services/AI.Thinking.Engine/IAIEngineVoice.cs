using Microsoft.CognitiveServices.Speech;

namespace AI.Thinking.Engine
{
    public interface IAIEngineVoice
    {
        Task<SpeechRecognitionResult?> SpeechToText(string base64, string language);
    }
}