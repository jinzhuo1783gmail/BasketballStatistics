# Basketball Voice Statistics - WebM Audio Setup

## Overview
This setup uses **WebM format** for both frontend recording and backend processing. The system converts WebM to WAV using FFmpeg before sending to Azure Speech Service.

## 🎵 Audio Format Specifications
- **Frontend**: WebM with Opus codec (fallback: WebM, OGG Opus)
- **Backend**: Converts WebM → WAV (16kHz, 16-bit, Mono) → Azure Speech Service
- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Bitrate**: 128kbps

## 🚀 Frontend Setup (React)

### Current Configuration
The frontend (`VoiceStatisticsInput.js`) now prioritizes:
1. `audio/webm;codecs=opus` (preferred)
2. `audio/webm` (fallback)
3. `audio/ogg;codecs=opus` (last resort)

### UI Display
Shows: **"Format: 16kHz, Opus Codec, Mono WebM"**

## 🖥️ Backend Setup Options

### Option 1: Simple Console Application
**File**: `Program_WebM_NAudio.cs`

```bash
# Build and run
dotnet build
dotnet run recording.webm zh-CN
```

**Features**:
- Processes WebM files directly
- Converts to WAV using FFmpeg
- Extracts basketball statistics
- Pattern matching for Chinese and English

### Option 2: Web API Integration
**File**: `AIEngineVoice_WebM_NAudio.cs`

**Features**:
- Handles Base64 WebM data from web app
- Converts WebM → WAV using FFmpeg
- Integrates with existing Azure Speech Service
- Comprehensive error handling and logging

## 📦 Required Dependencies

### NuGet Packages
```xml
<PackageReference Include="Microsoft.CognitiveServices.Speech" Version="1.34.1" />
<PackageReference Include="NAudio" Version="2.2.1" />
<PackageReference Include="NAudio.Lame" Version="2.1.0" />
```

### System Requirements
1. **FFmpeg** - Required for WebM to WAV conversion
   - Download: https://ffmpeg.org/download.html
   - Must be available in system PATH
   - Test: `ffmpeg -version`

2. **.NET 8.0** or later

## 🔧 FFmpeg Installation

### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html#build-windows
# Add to PATH environment variable
```

### Linux (Docker)
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

### macOS
```bash
# Using Homebrew
brew install ffmpeg
```

## ⚙️ Configuration

### Azure Speech Service
Update these values in your code:
```csharp
private static readonly string SpeechKey = "YOUR_AZURE_SPEECH_KEY";
private static readonly string ServiceRegion = "YOUR_AZURE_REGION"; // e.g., "eastus"
```

### Supported Languages
- `zh-CN` - Chinese (Simplified)
- `en-US` - English (US)
- `en-AU` - English (Australian)
- `zh-TW` - Chinese (Traditional)

## 🎯 Usage Examples

### Console Application
```bash
# Process Chinese audio
dotnet run recording.webm zh-CN

# Process English audio  
dotnet run recording.webm en-AU
```

### Expected Speech Patterns
**Chinese**:
- "黑队15号2分" → Dark team #15, 2 points
- "白队10号篮板" → Light team #10, rebound
- "黑队8号助攻" → Dark team #8, assist

**English**:
- "dark team 15 2 points" → Dark team #15, 2 points
- "light team 10 rebound" → Light team #10, rebound
- "dark team 8 assist" → Dark team #8, assist

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```
   ❌ WebM to WAV conversion failed: The system cannot find the file specified
   ```
   **Solution**: Install FFmpeg and add to PATH

2. **Empty audio data**
   ```
   ❌ Audio data is empty
   ```
   **Solution**: Check if recording is working in browser

3. **Silent audio**
   ```
   ⚠️ Audio appears to be silent or very quiet
   ```
   **Solution**: Check microphone permissions and volume

4. **Azure Speech timeout**
   ```
   ❌ ErrorCode=ServiceTimeout
   ```
   **Solution**: Check audio quality and format

### Debug Tips

1. **Check WebM file validity**:
   ```bash
   ffmpeg -i recording.webm -f null -
   ```

2. **Manual conversion test**:
   ```bash
   ffmpeg -i recording.webm -ar 16000 -ac 1 -sample_fmt s16 output.wav
   ```

3. **Verify Azure Speech Service**:
   - Check subscription key and region
   - Test with known good WAV file

## 📊 Performance Notes

### File Sizes (approximate)
- **WebM**: ~8KB per second (128kbps)
- **WAV**: ~32KB per second (16kHz, 16-bit, mono)

### Conversion Time
- **FFmpeg conversion**: ~100-500ms for typical 3-5 second recordings
- **Azure Speech**: ~1-3 seconds for recognition

## 🔄 Migration from OGG Opus

If migrating from OGG Opus format:

1. **Frontend**: Format priority changed to WebM first
2. **Backend**: Replace OGG processing with WebM → WAV conversion
3. **Dependencies**: Add FFmpeg requirement
4. **Docker**: Update Dockerfile to include FFmpeg instead of GStreamer

## 📝 Next Steps

1. Test with sample WebM recordings
2. Configure Azure Speech Service credentials
3. Install FFmpeg on target environment
4. Test end-to-end recording → processing → statistics extraction
5. Monitor conversion performance and adjust if needed

## 🆘 Support

For issues:
1. Check FFmpeg installation: `ffmpeg -version`
2. Verify WebM file format: `ffprobe recording.webm`
3. Test Azure credentials with simple WAV file
4. Review console logs for detailed error messages 