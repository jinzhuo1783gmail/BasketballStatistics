using AI.Thinking.Engine.EngineModel;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;

namespace AI.Thinking.Engine
{
    public class AIEngineVoice : IAIEngineVoice
    {
        private readonly EngineVoiceModel _voiceModel;

        public AIEngineVoice(EngineVoiceModel voiceModel)
        {
            _voiceModel = voiceModel;
        }

        public async Task<SpeechRecognitionResult?> SpeechToText(string base64, string language)
        {
            var speechKey = _voiceModel.SpeechKey;

            var config = SpeechConfig.FromSubscription(_voiceModel.SpeechKey.Decrypt(), _voiceModel.ServiceRegion);
            config.SpeechRecognitionLanguage = language;

            byte[] audioBytes = Convert.FromBase64String(base64);

            using var memoryStream = new MemoryStream(audioBytes);
            var audioFormat = AudioStreamFormat.GetCompressedFormat(AudioStreamContainerFormat.OGG_OPUS);
            using var pushStream = AudioInputStream.CreatePushStream(audioFormat);

            // Write the decoded audio into the push stream
            pushStream.Write(audioBytes);

            var audioConfig = AudioConfig.FromStreamInput(pushStream);
            using var recognizer = new SpeechRecognizer(config, audioConfig);

            return await recognizer.RecognizeOnceAsync();
        }
    }
}