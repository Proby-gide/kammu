import React from 'react';
import styled from 'styled-components';
import { Paper } from '@mui/material';
import BotAvatar from './BotAvatar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: ${props => props.$isBot ? '1rem 0 1rem auto' : '1rem auto 1rem 0'};
  max-width: 80%;
  flex-direction: ${props => props.$isBot ? 'row' : 'row-reverse'};
`;

const MessageBubble = styled(Paper)`
  padding: 1rem;
  border-radius: 1rem !important;
  background-color: ${props => {
    if (props.$isError) {
      return '#ffebee';
    }
    if (props.$darkMode) {
      return props.$isBot ? '#404040' : '#1976d2';
    }
    return props.$isBot ? 'white' : '#2196f3';
  }} !important;
  color: ${props => {
    if (props.$isError) {
      return '#c62828';
    }
    return props.$isBot ? (props.$darkMode ? 'white' : 'black') : 'white';
  }} !important;
  position: relative;
  box-shadow: none;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const MessageImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

function ChatMessage({ message, darkMode }) {
  const ownerPhrases = [
    'who built this kammu ai',
    'owner of this app',
    'who is the owner of this app',
    'who owns this app',
    'who created this app',
    'who made this app',
    'who developed this app',
    'who is the creator of this app',
    'who is the developer of this app',
  ];
  if (ownerPhrases.some(phrase => message.text.toLowerCase().includes(phrase))) {
    return <div>Kammu AI is built by Shreyas Shridhar Kulkarni</div>;
  }
  return (
    <MessageContainer $isBot={message.isBot}>
      
      <MessageBubble 
        elevation={0} 
        $isBot={message.isBot} 
        $darkMode={darkMode}
        $isError={message.isError}
      >
        <MessageContent>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.text}
          </ReactMarkdown>
          {message.files && message.files.length > 0 && (
            <ImageGrid>
              {message.files.map((file, index) => (
                <MessageImage
                  key={index}
                  src={file}
                  alt={`Uploaded ${index + 1}`}
                  onClick={() => window.open(file, '_blank')}
                />
              ))}
            </ImageGrid>
          )}
        </MessageContent>
      </MessageBubble>
    </MessageContainer>
  );
}

export default ChatMessage;
