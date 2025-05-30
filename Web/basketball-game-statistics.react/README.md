# Local Voice Recorder - OGG Opus Format

This C# console application records audio in OGG Opus format and sends it to your basketball statistics API.

## Setup Requirements

### Option 1: Using FFmpeg Command Line (Program.cs)
1. **Install FFmpeg**:
   - **Windows**: Download from https://ffmpeg.org/ or use `winget install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg` or `sudo yum install ffmpeg`

2. **Verify FFmpeg installation**:
   ```bash
   ffmpeg -version
   ```

3. **Build and run**:
   ```bash
   dotnet build
   dotnet run
   ```

### Option 2: Using FFMpegCore Library (Program_FFMpegCore.cs)
1. **Install FFmpeg** (same as above)

2. **Install FFMpegCore NuGet package**:
   ```bash
   dotnet add package FFMpegCore
   dotnet add package NAudio
   ```

3. **Rename the file**:
   ```bash
   # Use the FFMpegCore version
   mv Program.cs Program_Basic.cs
   mv Program_FFMpegCore.cs Program.cs
   ```

4. **Build and run**:
   ```bash
   dotnet build
   dotnet run
   ```

## Audio Format Specifications

### OGG Opus Settings:
- **Container**: OGG
- **Codec**: Opus
- **Sample Rate**: 16kHz
- **Bitrate**: 64 kbps
- **Channels**: 1 (Mono)
- **Application**: VOIP (optimized for speech)

### Comparison with Previous Formats:

| Format | File Size | Quality | Compression | Speech Recognition |
|--------|-----------|---------|-------------|-------------------|
| WAV | Large | Excellent | None | Good |
| WebM | Medium | Good | Moderate | Good |
| **OGG Opus** | **Small** | **Excellent** | **High** | **Excellent** |

## How It Works

1. **Record Audio**: Uses NAudio to capture 16kHz mono audio for 5 seconds
2. **Save as WAV**: Temporarily saves raw audio as WAV file
3. **Convert to OGG Opus**: Uses FFmpeg to convert WAV → OGG Opus
4. **Encode Base64**: Converts OGG file to Base64 string
5. **Send to API**: Posts the Base64 audio to your basketball statistics endpoint

## Code Structure

### Program.cs (Basic FFmpeg)
- `RecordAudioAsOggOpus()`: Main recording function
- `ConvertWavToOggOpus()`: FFmpeg command line conversion
- Fallback: Uses WAV if FFmpeg fails

### Program_FFMpegCore.cs (Advanced)
- `RecordAudioAsOggOpusWithFFMpegCore()`: File-based conversion
- `RecordAudioAsOggOpusInMemory()`: In-memory conversion (more efficient)
- Better error handling and more conversion options

## Benefits of OGG Opus

1. **Superior Compression**: ~50% smaller files than WAV
2. **Excellent Speech Quality**: Opus codec optimized for voice
3. **Low Latency**: Better for real-time applications
4. **Azure Speech Service**: Native support for OGG Opus
5. **Open Standard**: Free, royalty-free format
6. **Browser Compatible**: Matches your web app's preferred format

## Troubleshooting

### FFmpeg Not Found
```
❌ FFmpeg conversion error: The system cannot find the file specified
```
**Solution**: Install FFmpeg and ensure it's in your system PATH

### FFMpegCore Issues
```
❌ FFMpegCore conversion error: ...
```
**Solutions**:
1. Ensure FFmpeg is installed
2. Install FFMpegCore: `dotnet add package FFMpegCore`
3. Check FFmpeg permissions

### Audio Recording Issues
```
❌ Error starting recording: No audio device found
```
**Solutions**:
1. Check microphone permissions
2. Ensure audio device is connected
3. Try running as administrator

## Example Output

```
Local Voice Recorder (OGG Opus Base64)
Press any key to start recording (5 sec)...

Recording... (5 sec)
WAV recorded: 160,044 bytes
Converting WAV to OGG Opus...
✅ WAV to OGG Opus conversion successful!
OGG Opus created: 8,734 bytes

Audio recorded: 8,734 bytes
Base64 length: 11,646 characters
Base64 preview: T2dnUwACAAAAAAAAAADVEoqgAAAAAC...

Sending to API...
Sending request to: http://localhost:1001/api/playerstatistics
GameId: 1
Language: zh-CN
VoiceBase64 length: 11,646

Response status: OK
Response content: {"id":123,"team":1,"playerNumber":15,"inputText":"白队15号篮板",...}
✅ API request successful!

Done! Press any key to exit.
```

## Integration with Your Basketball App

This console app now generates the same OGG Opus format that your React web app prefers, ensuring consistency across platforms. The Base64 output can be directly sent to your `/api/playerstatistics` endpoint.
