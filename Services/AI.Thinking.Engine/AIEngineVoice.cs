using AI.Thinking.Engine.EngineModel;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using NAudio.Wave;
using NAudio.MediaFoundation;

namespace AI.Thinking.Engine
{
    public class AIEngineVoice : IAIEngineVoice
    {
        private readonly EngineVoiceModel _voiceModel;

        static AIEngineVoice()
        {
            // Initialize MediaFoundation for audio processing
            MediaFoundationApi.Startup();
        }

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
            
            // Convert to PCM WAV format
            byte[] pcmAudioBytes = await ConvertToPcmWav(audioBytes);

            using var memoryStream = new MemoryStream(pcmAudioBytes);
            using var audioFormat = AudioStreamFormat.GetWaveFormatPCM(16000, 16, 1);
            using var pushStream = AudioInputStream.CreatePushStream(audioFormat);

            pushStream.Write(pcmAudioBytes);
            pushStream.Close();

            var audioConfig = AudioConfig.FromStreamInput(pushStream);
            using var recognizer = new SpeechRecognizer(config, audioConfig);

            return await recognizer.RecognizeOnceAsync();
        }

        private async Task<byte[]> ConvertToPcmWav(byte[] inputBytes)
        {
            return await Task.Run(() =>
            {
                try
                {
                    Console.WriteLine($"🎵 Processing audio ({inputBytes.Length} bytes)...");

                    // Create a temporary file to work with MediaFoundationReader
                    string tempInputFile = Path.GetTempFileName();
                    string tempOutputFile = Path.GetTempFileName() + ".wav";

                    try
                    {
                        // Write input bytes to temp file
                        File.WriteAllBytes(tempInputFile, inputBytes);
                        
                        // Try to read the audio file
                        using var reader = new MediaFoundationReader(tempInputFile);
                        
                        // Convert to 16kHz, 16-bit, mono
                        var targetFormat = new WaveFormat(16000, 16, 1);
                        using var resampler = new MediaFoundationResampler(reader, targetFormat);
                        
                        // Write as WAV to temp file
                        WaveFileWriter.CreateWaveFile(tempOutputFile, resampler);
                        
                        // Read the converted file
                        var result = File.ReadAllBytes(tempOutputFile);
                        Console.WriteLine($"✅ Audio conversion successful: {result.Length} bytes");
                        return result;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ MediaFoundation conversion failed: {ex.Message}");
                        
                        // Fallback: Try to process as WAV directly
                        return ProcessAsWav(inputBytes);
                    }
                    finally
                    {
                        // Cleanup temp files
                        try
                        {
                            if (File.Exists(tempInputFile)) File.Delete(tempInputFile);
                            if (File.Exists(tempOutputFile)) File.Delete(tempOutputFile);
                        }
                        catch { /* Ignore cleanup errors */ }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Audio processing failed: {ex.Message}");
                    return ProcessAsWav(inputBytes);
                }
            });
        }

        private byte[] ProcessAsWav(byte[] inputBytes)
        {
            try
            {
                Console.WriteLine("🔄 Attempting to process as WAV format...");
                
                using var inputStream = new MemoryStream(inputBytes);
                using var outputStream = new MemoryStream();
                
                // Try to read as WAV
                using var reader = new WaveFileReader(inputStream);
                
                // Check if we need to resample
                if (reader.WaveFormat.SampleRate == 16000 && 
                    reader.WaveFormat.Channels == 1 && 
                    reader.WaveFormat.BitsPerSample == 16)
                {
                    // Already in correct format
                    Console.WriteLine("✅ Audio already in correct format");
                    return inputBytes;
                }
                
                // Need to resample
                var targetFormat = new WaveFormat(16000, 16, 1);
                using var resampler = new MediaFoundationResampler(reader, targetFormat);
                
                WaveFileWriter.WriteWavFileToStream(outputStream, resampler);
                
                var result = outputStream.ToArray();
                Console.WriteLine($"✅ WAV resampling successful: {result.Length} bytes");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ WAV processing failed: {ex.Message}");
                
                // Final fallback: Create basic WAV header
                return CreateBasicWavFile(inputBytes);
            }
        }

        private byte[] CreateBasicWavFile(byte[] audioData)
        {
            Console.WriteLine("📝 Creating basic WAV file as final fallback...");
            
            // Create a basic WAV file with proper header
            using var memoryStream = new MemoryStream();
            using var writer = new BinaryWriter(memoryStream);

            // WAV header for 16kHz, 16-bit, mono
            writer.Write("RIFF".ToCharArray());
            writer.Write(36 + audioData.Length);
            writer.Write("WAVE".ToCharArray());
            writer.Write("fmt ".ToCharArray());
            writer.Write(16); // PCM format chunk size
            writer.Write((short)1); // PCM format
            writer.Write((short)1); // Mono
            writer.Write(16000); // Sample rate
            writer.Write(32000); // Byte rate (16000 * 1 * 16 / 8)
            writer.Write((short)2); // Block align
            writer.Write((short)16); // Bits per sample
            writer.Write("data".ToCharArray());
            writer.Write(audioData.Length);
            writer.Write(audioData);

            Console.WriteLine($"📝 Created basic WAV file: {memoryStream.Length} bytes");
            return memoryStream.ToArray();
        }
    }
}