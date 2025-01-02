import React from 'react';
import styled from 'styled-components';
import botLogo from '../assets/bot-logo.png';

const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2B579A;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const AvatarImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
`;

function BotAvatar() {
  return (
    <AvatarContainer>
      <AvatarImage src={botLogo} alt="AI Assistant" />
    </AvatarContainer>
  );
}

export default BotAvatar;
