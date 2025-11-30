import * as React from 'react';
import styled, { css } from 'styled-components';
import TeamCard from './team-card';

const ButtonCommon = styled.button`
  background-color: #ed453b;
  height: 40px;
  border: unset;
  border-radius: 20px;
  color: white;
  font-size: 16px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 10px;
  width: 350px;
  height: 100%;
`;

const AddTeamContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Title = styled.div`
  color: white;
  font-size: 20px;
`;

const AddTeamInput = styled.input`
  height: 40px;
  border-radius: 20px;
  width: 80%;
  border: unset;
  outline: unset;
  padding-left: 10px;
`;

const AddTeamButton = styled(ButtonCommon)`
  width: 40px;
  font-size: 24px;

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      pointer-events: none;
      background-color: #7c7c7c;
    `}
`;

const StartGameButton = styled(ButtonCommon)`
  ${({ isDisabled }) =>
    isDisabled &&
    css`
      pointer-events: none;
      background-color: #7c7c7c;
    `}
`;

const TeamsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GameStatusContainer = styled.div`
  margin-top: auto;
`;

const GameControls = ({
  onTeamAdded,
  onTeamClick,
  onGameStart,
  onTurnComplete,
  gameState,
  teams,
  activeTeam,
  currentTurn,
  roundNumber,
}) => {
  const [teamNameInput, setTeamNameInput] = React.useState('');

  return (
    <ControlsContainer>
      {gameState === 'prepare' && (
        <>
          <AddTeamContainer>
            <AddTeamInput
              name="teamNameInput"
              value={teamNameInput}
              placeholder="Имя комманды"
              onChange={(e) => setTeamNameInput(e.target.value)}
            />
            <AddTeamButton
              onClick={() => {
                if (!teamNameInput) return;
                onTeamAdded(teamNameInput);
                setTeamNameInput('');
              }}
              isDisabled={teams.length > 6 || !teamNameInput}
            >
              +
            </AddTeamButton>
          </AddTeamContainer>
          <StartGameButton onClick={onGameStart} isDisabled={teams.length < 2}>
            Начать игру
          </StartGameButton>
        </>
      )}
      <TeamsList>
        {teams.map((team, index) => (
          <TeamCard
            key={team.name}
            team={team}
            onTeamClick={() => onTeamClick(index)}
            isMyTurn={index === activeTeam}
            gameState={gameState}
          />
        ))}
      </TeamsList>
      {gameState !== 'prepare' && (
        <GameStatusContainer>
          <ButtonCommon onClick={() => onTurnComplete()}>TMP NEXT TURN</ButtonCommon>
          <Title>Раунд: {roundNumber}</Title>
          <Title>Ход команды: {teams[activeTeam].name}</Title>
        </GameStatusContainer>
      )}
    </ControlsContainer>
  );
};

export default GameControls;


