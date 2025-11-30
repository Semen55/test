import * as React from 'react';
import styled from 'styled-components';
import Avatar from 'boring-avatars';

const TeamCardContainer = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  background-color: ${({ teamColor }) => teamColor};
  border-radius: 10px;
  height: 80px;
  width: auto;
  padding: 5px;
  color: #222;
`;

const ActiveMarker = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  background-color: #7cb174;
  border: 1px solid #222;
  border-radius: 50%;
`;

const TeamCardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  border-radius: 10px;
  padding: 5px;
  height: 68px;
  width: 60%;
  border: 1px solid #c5c5c5;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TeamName = styled.div`
  font-size: 22px;
  font-weight: 700;
`;

const DeadBadge = styled.div`
  writing-mode: vertical-lr;
  text-transform: uppercase;
  text-align: center;
  font-weight: 900;
  margin-left: auto;
`;

const TeamCard = ({ team, isMyTurn, onTeamClick, gameState }) => {
  return (
    <TeamCardContainer onClick={onTeamClick} teamColor={team.color}>
      <AvatarContainer>
        <Avatar size={75} name={team.name} variant="beam" />
      </AvatarContainer>
      <TeamCardContentContainer>
        <TeamName>{team.name}</TeamName>
        <div>Очки: {team.score}</div>
      </TeamCardContentContainer>
      {gameState !== 'prepare' && team.zones.length === 0 && <DeadBadge>Выбыл</DeadBadge>}
      {isMyTurn && <ActiveMarker />}
    </TeamCardContainer>
  );
};

export default TeamCard;


