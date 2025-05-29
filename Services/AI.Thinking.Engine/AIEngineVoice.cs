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
            var config = SpeechConfig.FromSubscription(_voiceModel.SpeechKey.Decrypt(), _voiceModel.ServiceRegion);
            config.SpeechRecognitionLanguage = language;

            byte[] audioBytes = Convert.FromBase64String(base64);
            
            // Convert to PCM WAV format using FFmpeg
            byte[] pcmAudioBytes = await ConvertToPcmWav(audioBytes);
            if (pcmAudioBytes == null) return null;

            // Process as WAV PCM
            var audioFormat = AudioStreamFormat.GetWaveFormatPCM(16000, 16, 1);
            using var pushStream = AudioInputStream.CreatePushStream(audioFormat);

            // Skip WAV header if present
            if (pcmAudioBytes.Length > 44 && 
                pcmAudioBytes[0] == 0x52 && pcmAudioBytes[1] == 0x49 && 
                pcmAudioBytes[2] == 0x46 && pcmAudioBytes[3] == 0x46)
            {
                pcmAudioBytes = pcmAudioBytes.Skip(44).ToArray();
            }

            pushStream.Write(pcmAudioBytes);
            pushStream.Close();

            var audioConfig = AudioConfig.FromStreamInput(pushStream);
            using var recognizer = new SpeechRecognizer(config, audioConfig);

            return await recognizer.RecognizeOnceAsync();
        }

        private async Task<byte[]?> ConvertToPcmWav(byte[] inputBytes)
        {
            try
            {
                Console.WriteLine($"🎵 Processing audio ({inputBytes.Length} bytes)...");

                // Use FFmpeg to convert any audio format to 16kHz, 16-bit, mono WAV
                var process = new System.Diagnostics.Process
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "ffmpeg",
                        Arguments = "-i pipe:0 -ar 16000 -ac 1 -sample_fmt s16 -f wav pipe:1",
                        UseShellExecute = false,
                        RedirectStandardInput = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                process.Start();

                // Write input audio to stdin
                await process.StandardInput.BaseStream.WriteAsync(inputBytes, 0, inputBytes.Length);
                process.StandardInput.Close();

                // Read converted WAV from stdout
                var outputStream = new MemoryStream();
                await process.StandardOutput.BaseStream.CopyToAsync(outputStream);
                
                await process.WaitForExitAsync();

                if (process.ExitCode == 0)
                {
                    var result = outputStream.ToArray();
                    Console.WriteLine($"✅ Audio conversion successful: {result.Length} bytes");
                    return result;
                }
                else
                {
                    var error = await process.StandardError.ReadToEndAsync();
                    Console.WriteLine($"❌ FFmpeg conversion failed: {error}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Audio processing failed: {ex.Message}");
                return null;
            }
        }
    }
}