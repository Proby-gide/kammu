import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Paper, IconButton, TextField, CircularProgress, Badge, Tooltip } from '@mui/material';
import { Send, Mic, WbSunny, DarkMode, Image, Stop } from '@mui/icons-material';
import ChatMessage from './components/ChatMessage';
import BotAvatar from './components/BotAvatar';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Menu from './components/Menu';
import { getChatResponse, getImageAnalysis } from './services/geminiService';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './styles/auth.css';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
  },
});

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$darkMode ? '#1a1a1a' : '#f5f5f5'};
  transition: background-color 0.3s ease;
`;

const Header = styled(Paper)`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.$darkMode ? '#2d2d2d' : 'white'} !important;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputContainer = styled(Paper)`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: ${props => props.$darkMode ? '#2d2d2d' : 'white'} !important;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow-x: auto;
  max-width: 100%;
`;

const ImagePreview = styled.img`
  height: 50px;
  width: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

function App() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Kammu AI built by Shreyas Shridhar Kulkarni. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Show loading spinner while checking auth state
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(94, 114, 235, 0.1) 0%, rgba(255, 107, 237, 0.1) 100%)'
      }}>
        <CircularProgress style={{ color: '#5E72EB' }} />
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    const userMessage = {
      text: input,
      isBot: false,
      files: selectedFiles.map(file => URL.createObjectURL(file))
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (selectedFiles.length > 0) {
        const prompt = input || "What's in this image?";
        response = await getImageAnalysis(selectedFiles, prompt);
      } else {
        response = await getChatResponse(input);
      }

      const botMessage = {
        text: response,
        isBot: true
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: error.message || "I apologize, but I encountered an error. Please try again.",
        isBot: true,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Error getting response:", error);
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        // Convert audio to text using Web Speech API
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setInput(transcript);
        };

        recognition.onerror = (e) => {
          console.error('Speech recognition error:', e);
        };

        recognition.start();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
            <Route
              path="/"
              element={
                user ? (
                  <AppContainer $darkMode={darkMode}>
                    <Header $darkMode={darkMode}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <BotAvatar />
                        <h1 style={{ color: darkMode ? 'white' : 'black' }}>Kammu AI</h1>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <IconButton 
                          onClick={() => setDarkMode(!darkMode)}
                          style={{
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {darkMode ? 
                            <WbSunny style={{ color: '#FFD700' }} /> : 
                            <DarkMode style={{ color: '#5E72EB' }} />
                          }
                        </IconButton>
                      </div>
                    </Header>
                    <ChatContainer>
                      {messages.map((message, index) => (
                        <ChatMessage
                          key={index}
                          message={message}
                          darkMode={darkMode}
                        />
                      ))}
                      <div ref={chatEndRef} />
                    </ChatContainer>
                    <InputContainer $darkMode={darkMode}>
                      <HiddenInput
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setSelectedFiles(prev => [...prev, ...files]);
                        }}
                      />
                      {selectedFiles.length > 0 && (
                        <ImagePreviewContainer>
                          {selectedFiles.map((file, index) => (
                            <Badge
                              key={index}
                              badgeContent="×"
                              color="error"
                              onClick={() => handleRemoveFile(index)}
                              style={{ cursor: 'pointer' }}
                            >
                              <ImagePreview
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                              />
                            </Badge>
                          ))}
                        </ImagePreviewContainer>
                      )}
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        style={{
                          backgroundColor: darkMode ? '#3d3d3d' : '#f5f5f5',
                          borderRadius: '8px'
                        }}
                        InputProps={{
                          style: {
                            color: darkMode ? 'white' : 'black',
                          }
                        }}
                      />
                      <Tooltip title="Attach image">
                        <IconButton
                          onClick={() => fileInputRef.current.click()}
                          disabled={isLoading}
                        >
                          <Image />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                        color="primary"
                      >
                        {isLoading ? <CircularProgress size={24} /> : <Send />}
                      </IconButton>
                    </InputContainer>
                  </AppContainer>
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
          </Routes>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
