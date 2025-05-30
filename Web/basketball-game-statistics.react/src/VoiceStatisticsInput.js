import React, { useState, useRef, useEffect } from 'react';
import './VoiceStatisticsInput.css';

function getApiBaseUrl() {
  return process.env.REACT_APP_API_GAME;
}

export default function VoiceStatisticsInput({ gameId, gameName, onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [statistics, setStatistics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Load existing statistics when component mounts
  useEffect(() => {
    loadExistingStatistics();
  }, [gameId]);

  const loadExistingStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${getApiBaseUrl()}api/playerstatistics/game/${gameId}`;
      
      console.log('📊 Loading existing statistics from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const existingStats = await response.json();
        console.log('📊 Loaded existing statistics:', existingStats);
        
        // Convert existing stats to the same format as new entries
        const formattedStats = existingStats.map(stat => ({
          id: stat.id || stat.Id || Date.now() + Math.random(),
          type: 'success',
          data: stat,
          message: formatTeamInfo(
            stat.Team || stat.team,
            stat.PlayerNumber || stat.playerNumber,
            stat.InputText || stat.inputText,
            stat.id || stat.Id,
            stat
          ),
          timestamp: stat.createDate ? new Date(stat.createDate) : new Date(),
          isExisting: true
        }));
        
        // Sort by timestamp, most recent first
        formattedStats.sort((a, b) => b.timestamp - a.timestamp);
        
        setStatistics(formattedStats);
        console.log('✅ Statistics loaded and formatted:', formattedStats.length, 'items');
      } else {
        console.log('⚠️ No existing statistics found or error loading:', response.status);
        setStatistics([]);
      }
    } catch (error) {
      console.error('❌ Error loading existing statistics:', error);
      setStatistics([]);
    }
    setIsLoadingStats(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      // When back button is pressed, go back to admin
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  // Test function to verify Unicode display - you can call this from console
  const testUnicodeDisplay = () => {
    const testData = {
      id: 12345,
      Team: 2,
      PlayerNumber: 15,
      InputText: "黑队15号篮板",
      Point: 0,
      Rebound: 1,
      Assist: 0,
      Block: 0,
      Steal: 0,
      Foul: 0
    };
    
    console.log('🧪 Testing Unicode display with:', testData);
    addSuccessMessage(testData);
  };

  // Make test function available globally for debugging
  useEffect(() => {
    window.testUnicodeDisplay = testUnicodeDisplay;
    return () => {
      delete window.testUnicodeDisplay;
    };
  }, []);

  const formatTeamInfo = (team, playerNumber, inputText, statisticId, playerStatistic) => {
    // Ensure proper Unicode handling
    const teamName = team === 1 ? '白队' : team === 2 ? '黑队' : '未知队';
    const teamNameEn = team === 1 ? 'Light' : team === 2 ? 'Dark' : 'Unknown';
    
    // Handle undefined values properly
    const safePlayerNumber = playerNumber || 'undefined';
    const safeInputText = inputText || 'undefined';
    const safeStatisticId = statisticId || 'undefined';
    
    // Determine the action based on statistics values
    let action = '';
    
    if (playerStatistic) {
      // Check for points (various field names)
      const points = playerStatistic.Point || playerStatistic.point || playerStatistic.Points || playerStatistic.points;
      if (points && points > 0) {
        action = `${points} point${points > 1 ? 's' : ''}`;
      }
      
      // Check for rebounds
      const rebounds = playerStatistic.Rebound || playerStatistic.rebound || playerStatistic.Rebounds || playerStatistic.rebounds;
      if (rebounds && rebounds > 0 && !action) {
        action = rebounds > 1 ? `${rebounds} rebounds` : 'rebound';
      }
      
      // Check for assists
      const assists = playerStatistic.Assist || playerStatistic.assist || playerStatistic.Assists || playerStatistic.assists;
      if (assists && assists > 0 && !action) {
        action = assists > 1 ? `${assists} assists` : 'assist';
      }
      
      // Check for blocks
      const blocks = playerStatistic.Block || playerStatistic.block || playerStatistic.Blocks || playerStatistic.blocks;
      if (blocks && blocks > 0 && !action) {
        action = blocks > 1 ? `${blocks} blocks` : 'block';
      }
      
      // Check for steals
      const steals = playerStatistic.Steal || playerStatistic.steal || playerStatistic.Steals || playerStatistic.steals;
      if (steals && steals > 0 && !action) {
        action = steals > 1 ? `${steals} steals` : 'steal';
      }
      
      // Check for fouls
      const fouls = playerStatistic.Foul || playerStatistic.foul || playerStatistic.Fouls || playerStatistic.fouls;
      if (fouls && fouls > 0 && !action) {
        action = fouls > 1 ? `${fouls} fouls` : 'foul';
      }
      
      // Check for missed shots
      const missShots = playerStatistic.MissShoot || playerStatistic.missShoot || playerStatistic.Miss_Shoot || playerStatistic.miss_shoot;
      if (missShots && missShots > 0 && !action) {
        action = missShots > 1 ? `${missShots} missed shots` : 'missed shot';
      }
    }
    
    console.log('🔤 Formatting team info:', {
      statisticId: safeStatisticId,
      team,
      playerNumber: safePlayerNumber,
      inputText: safeInputText,
      teamName,
      teamNameEn,
      action,
      playerStatistic
    });
    
    // Build the final format: (statistic id, team, number, action)
    const formatParts = [safeStatisticId, teamNameEn, `number ${safePlayerNumber}`];
    if (action) {
      formatParts.push(action);
    }
    
    return `${teamName}，${safePlayerNumber}号，${safeInputText} (${formatParts.join(', ')})`;
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          sampleSize: 16,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      console.log('🎵 Audio stream obtained:', stream);
      console.log('🔧 Audio tracks:', stream.getAudioTracks());
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Try different formats in order of preference - prioritizing OGG Opus
      let mimeType = 'audio/ogg;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      console.log('🎵 Using MIME type:', mimeType || 'browser default');
      console.log('🎵 Supported types check:');
      console.log('  - audio/ogg;codecs=opus:', MediaRecorder.isTypeSupported('audio/ogg;codecs=opus'));
      console.log('  - audio/webm;codecs=opus:', MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
      console.log('  - audio/webm:', MediaRecorder.isTypeSupported('audio/webm'));
      
      const options = {
        audioBitsPerSecond: 128000 // 128 kbps for good quality
      };
      
      if (mimeType) {
        options.mimeType = mimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      console.log('📹 MediaRecorder created:', mediaRecorder);
      console.log('📊 MediaRecorder state:', mediaRecorder.state);
      console.log('📊 MediaRecorder mimeType:', mediaRecorder.mimeType);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Data available event:', event.data.size, 'bytes, type:', event.data.type);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('⏹️ Recording stopped. Total chunks:', audioChunksRef.current.length);
        console.log('📝 Chunk sizes:', audioChunksRef.current.map(chunk => chunk.size));
        
        // Use the actual mimeType from the recorder
        const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        
        console.log('🎵 Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
        console.log('🎵 Final MIME type used:', actualMimeType);
        
        convertToBase64AndSend(audioBlob);
      };
      
      // Start recording with timeslice for better data flow
      mediaRecorder.start(1000); // 1 second chunks
      console.log('▶️ Recording started with OGG Opus format (or fallback)');
      setIsRecording(true);
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    console.log('⏸️ Stopping recording...');
    console.log('📊 Current recording state:', isRecording);
    console.log('📹 MediaRecorder state:', mediaRecorderRef.current?.state);
    
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Actually stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        console.log('🔇 Stopping audio tracks...');
        streamRef.current.getTracks().forEach(track => {
          console.log('🔇 Stopping track:', track.kind, track.label);
          track.stop();
        });
      }
    } else {
      console.log('⚠️ Cannot stop recording - invalid state');
    }
  };

  const convertToBase64AndSend = async (audioBlob) => {
    setIsLoading(true);
    console.log('🔄 Converting audio to base64...');
    console.log('🎵 Audio blob details:', {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        console.log('📄 FileReader result length:', reader.result.length);
        console.log('📄 FileReader result preview:', reader.result.substring(0, 100) + '...');
        
        const base64Audio = reader.result.split(',')[1]; // Remove data:audio/ogg;base64, or similar prefix
        
        console.log('✅ Base64 conversion complete:');
        console.log('  - Original audio size:', audioBlob.size, 'bytes');
        console.log('  - Base64 length:', base64Audio.length, 'characters');
        console.log('  - Base64 preview:', base64Audio.substring(0, 50) + '...');
        console.log('  - Base64 ending:', '...' + base64Audio.substring(base64Audio.length - 50));
        
        await sendVoiceData(base64Audio);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('❌ Error converting audio to base64:', error);
      addErrorMessage('Failed to process audio');
      setIsLoading(false);
    }
  };

  const sendVoiceData = async (base64Audio) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Auth token length:', token ? token.length : 'No token');
      
      const request = {
        GameId: gameId,
        VoiceBase64: base64Audio,
        Language: language
      };

      console.log('📤 Request payload details:');
      console.log('  - GameId:', request.GameId);
      console.log('  - Language:', request.Language);
      console.log('  - VoiceBase64 length:', request.VoiceBase64.length, 'characters');
      console.log('  - VoiceBase64 preview:', request.VoiceBase64.substring(0, 50) + '...');

      // Use environment-based API URL
      const apiUrl = `${getApiBaseUrl()}api/playerstatistics`;
      console.log('🌐 Sending to API URL:', apiUrl);

      const startTime = Date.now();
      console.log('⏰ Request started at:', new Date().toISOString());

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('📥 Response received:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Duration:', duration, 'ms');
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 200) {
        const responseText = await response.text();
        console.log('📄 Raw response text:', responseText);
        console.log('📄 Response text length:', responseText.length);
        
        try {
          const playerStatistic = JSON.parse(responseText);
          console.log('✅ Parsed response:', playerStatistic);
          console.log('🔍 Detailed field analysis:');
          console.log('  - Team:', playerStatistic.Team, '(type:', typeof playerStatistic.Team, ')');
          console.log('  - PlayerNumber:', playerStatistic.PlayerNumber, '(type:', typeof playerStatistic.PlayerNumber, ')');
          console.log('  - InputText:', playerStatistic.InputText, '(type:', typeof playerStatistic.InputText, ')');
          console.log('  - All keys:', Object.keys(playerStatistic));
          console.log('  - All values:', Object.values(playerStatistic));
          
          // Check for common field name variations
          const possiblePlayerNumberFields = ['PlayerNumber', 'playerNumber', 'Player_Number', 'player_number', 'Number'];
          const possibleInputTextFields = ['InputText', 'inputText', 'Input_Text', 'input_text', 'Text', 'RecognizedText'];
          
          console.log('🔍 Checking for alternative field names:');
          possiblePlayerNumberFields.forEach(field => {
            if (playerStatistic[field] !== undefined) {
              console.log(`  - Found PlayerNumber as '${field}':`, playerStatistic[field]);
            }
          });
          
          possibleInputTextFields.forEach(field => {
            if (playerStatistic[field] !== undefined) {
              console.log(`  - Found InputText as '${field}':`, playerStatistic[field]);
            }
          });
          
          // Log the complete object structure
          console.log('📋 Complete response object:', JSON.stringify(playerStatistic, null, 2));
          
          // Log Unicode details for debugging
          if (playerStatistic.InputText) {
            console.log('🔤 InputText Unicode analysis:');
            console.log('  - Raw value:', playerStatistic.InputText);
            console.log('  - Length:', playerStatistic.InputText.length);
            console.log('  - Character codes:', Array.from(playerStatistic.InputText).map(c => `${c}(${c.charCodeAt(0)})`));
            console.log('  - JSON stringified:', JSON.stringify(playerStatistic.InputText));
          } else {
            console.log('⚠️ InputText is null/undefined/empty');
          }
          
          console.log('✅ API request completed successfully in', duration, 'ms');
          addSuccessMessage(playerStatistic);
        } catch (parseError) {
          console.error('❌ JSON parsing failed:', parseError);
          console.log('❌ Raw response that failed to parse:', responseText);
          addErrorMessage('Failed to parse response');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Error response details:');
        console.log('  - Status:', response.status);
        console.log('  - Error text:', errorText);
        console.log('  - Duration:', duration, 'ms');
        
        // Try to parse error as JSON first, fallback to plain text
        let errorMessage = 'Failed to insert';
        try {
          const errorJson = JSON.parse(errorText);
          console.log('📋 Parsed error JSON:', errorJson);
          
          // Try different common error message fields
          errorMessage = errorJson.message || 
                        errorJson.error || 
                        errorJson.detail || 
                        errorJson.title || 
                        errorJson.Message || 
                        errorJson.Error || 
                        errorJson.Detail || 
                        errorJson.Title ||
                        errorText || 
                        `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          console.log('⚠️ Error response is not JSON, using as plain text');
          // Use the raw error text if it's not JSON
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.log('📝 Final error message to display:', errorMessage);
        addErrorMessage(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error sending voice data:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to insert';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request was cancelled';
      } else if (error.name === 'TimeoutError') {
        errorMessage = 'Request timed out';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      console.log('📝 Final network error message to display:', errorMessage);
      addErrorMessage(errorMessage);
    }
    
    setIsLoading(false);
  };

  const addSuccessMessage = (playerStatistic) => {
    console.log('✅ Adding success message for:', playerStatistic);
    console.log('📊 PlayerStatistic details:', {
      Team: playerStatistic.Team,
      PlayerNumber: playerStatistic.PlayerNumber,
      InputText: playerStatistic.InputText,
      // Log the actual Unicode values
      InputTextBytes: playerStatistic.InputText ? Array.from(playerStatistic.InputText).map(c => c.charCodeAt(0)) : null
    });
    
    // Try to find the correct field names (handle different casing/naming)
    const team = playerStatistic.Team || playerStatistic.team;
    const playerNumber = playerStatistic.PlayerNumber || playerStatistic.playerNumber || 
                        playerStatistic.Player_Number || playerStatistic.player_number || 
                        playerStatistic.Number || playerStatistic.number;
    const inputText = playerStatistic.InputText || playerStatistic.inputText || 
                     playerStatistic.Input_Text || playerStatistic.input_text || 
                     playerStatistic.Text || playerStatistic.text ||
                     playerStatistic.RecognizedText || playerStatistic.recognizedText;
    
    // Try to find the statistic ID
    const statisticId = playerStatistic.id || playerStatistic.Id || playerStatistic.ID ||
                       playerStatistic.statisticId || playerStatistic.StatisticId ||
                       playerStatistic.statistic_id || playerStatistic.Statistic_Id;
    
    console.log('🔧 Extracted values after field name checking:', {
      statisticId,
      team,
      playerNumber,
      inputText
    });
    
    const newEntry = {
      id: Date.now(),
      type: 'success',
      data: playerStatistic,
      message: formatTeamInfo(team, playerNumber, inputText, statisticId, playerStatistic),
      timestamp: new Date()
    };
    
    console.log('📝 Created message entry:', newEntry);
    
    setStatistics(prev => [newEntry, ...prev]);
  };

  const addErrorMessage = (message) => {
    const newEntry = {
      id: Date.now(),
      type: 'error',
      message: message,
      timestamp: new Date()
    };
    
    setStatistics(prev => [newEntry, ...prev]);
  };

  const removeStatistic = async (statisticId, statisticData) => {
    // Show confirmation dialog with ID and input text
    const inputText = statisticData?.InputText || statisticData?.inputText || statisticData?.Input_Text || 'No text available';
    const confirmMessage = `Are you sure you want to remove this statistic?\n\nID: ${statisticId}\nText: ${inputText}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${getApiBaseUrl()}api/playerstatistics/revert`;
      
      console.log('🗑️ Removing statistic:', statisticId);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: statisticId.toString() })
      });

      if (response.status === 200) {
        // Remove from local state
        setStatistics(prev => prev.filter(stat => {
          const statId = stat.data?.id || stat.data?.Id || stat.data?.ID || stat.id;
          return statId !== statisticId;
        }));
        
        console.log('✅ Statistic removed successfully');
        
        // Show success message briefly
        const successEntry = {
          id: Date.now(),
          type: 'success',
          message: 'Statistic removed successfully',
          timestamp: new Date()
        };
        setStatistics(prev => [successEntry, ...prev]);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          setStatistics(prev => prev.filter(stat => stat.id !== successEntry.id));
        }, 3000);
      } else {
        const errorText = await response.text();
        console.log('❌ Failed to remove statistic:', response.status, errorText);
        alert(`Failed to remove statistic: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error removing statistic:', error);
      alert(`Error removing statistic: ${error.message}`);
    }
  };

  const handleMouseDown = () => {
    console.log('🖱️ Mouse down - attempting to start recording');
    console.log('📊 Current states - isLoading:', isLoading, 'isRecording:', isRecording);
    if (!isLoading) {
      startRecording();
    } else {
      console.log('⚠️ Cannot start recording - currently loading');
    }
  };

  const handleMouseUp = () => {
    console.log('🖱️ Mouse up - attempting to stop recording');
    console.log('📊 Current recording state:', isRecording);
    if (isRecording) {
      stopRecording();
    }
  };

  const handleMouseLeave = () => {
    console.log('🖱️ Mouse leave - attempting to stop recording');
    console.log('📊 Current recording state:', isRecording);
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <div className="voice-statistics-input">
      <div className="voice-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Games
        </button>
        <h2>Voice Statistics Input</h2>
        <p>Game: {gameName} (ID: {gameId})</p>
      </div>

      <div className="statistics-list">
        <h3>Statistics Log</h3>
        {isLoadingStats ? (
          <div className="loading-stats">
            <div className="loading-spinner">🔄</div>
            <p>Loading existing statistics...</p>
          </div>
        ) : statistics.length === 0 ? (
          <p className="no-stats">No statistics recorded yet</p>
        ) : (
          <div className="stats-table">
            {statistics.map((stat) => {
              // Determine team for color coding
              const team = stat.data?.Team || stat.data?.team || 0;
              const teamClass = team === 1 ? 'light-team' : team === 2 ? 'dark-team' : '';
              
              // Get the statistic ID for removal
              const statisticId = stat.data?.id || stat.data?.Id || stat.data?.ID;
              const canRemove = statisticId && stat.type === 'success';
              
              return (
                <div key={stat.id} className={`stat-entry ${stat.type} ${teamClass}`}>
                  {canRemove && (
                    <button 
                      className="remove-btn"
                      onClick={() => removeStatistic(statisticId, stat.data)}
                      title="Remove this statistic"
                    >
                      ×
                    </button>
                  )}
                  <div className="stat-icon">
                    {stat.type === 'success' ? '✅' : '❌'}
                  </div>
                  <div className="stat-content">
                    <div className="stat-message">{stat.message}</div>
                    <div className="stat-time">
                      {stat.timestamp.toLocaleTimeString()}
                      {stat.isExisting && <span className="existing-indicator"> (existing)</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="voice-controls">
        <div className="language-selector">
          <label htmlFor="language">Language:</label>
          <select 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRecording || isLoading}
          >
            <option value="zh-CN">中文 (zh-CN)</option>
            <option value="en-AU">English (en-AU)</option>
          </select>
        </div>

        <button
          className={`voice-record-btn ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Processing...' : isRecording ? '🔴 Recording...' : '🎤 Hold to Record'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '14px' }}>
        <div style={{ marginBottom: '10px' }}>
          Format: 16kHz, Opus Codec, Mono OGG • Language: {language === 'zh-CN' ? '中文' : 'English'}
        </div>
      </div>
    </div>
  );
} 