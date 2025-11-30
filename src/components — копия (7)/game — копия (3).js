import * as React from 'react';
import styled from 'styled-components';
import GameControls from './game-controls';
import Map from './map';
import { shuffleArray } from '../logic/utils';

// Стилизованные компоненты
const GameContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
  position: relative;
  height: calc(100% - 20px);
`;

const CaptureModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CaptureModalCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 24px 72px;
  width: 95%;
  max-width: 1100px;
  height: 80vh;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CaptureModalImagePlaceholder = styled.div`
  width: 100%;
  height: 80px;
  border-radius: 8px;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 14px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const CaptureModalTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 20px;
`;

const CaptureModalText = styled.p`
  margin: 12px 0 20px;
  font-size: 14px;
  color: #444;
`;

const CaptureModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
`;

const CaptureButton = styled.button`
  position: relative;
  width: 100px;
  height: 100px;
  padding: 0;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.05s ease-in-out, box-shadow 0.05s ease-in-out,
    background-color 0.1s ease-in-out, filter 0.1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: attr(data-order);
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.15);
    color: #111;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:active {
    transform: translateY(1px);
    filter: brightness(0.9);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  &.cancel {
    background: #e5e5e5;
    
    &.active {
      background: #d4d4d4;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  &.confirm {
    background: #16a34a;
    
    &.active {
      background: #15803d;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  &.confirm-alt {
    background: #22c55e;
    
    &.active {
      background: #16a34a;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  &.cancel-alt {
    background: #f97316;
    
    &.active {
      background: #ea580c;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }
`;

const CaptureModalColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button`
  position: absolute;
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.disabled ? '#ccc' : '#16a34a'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
`;

const UndoButton = styled(ActionButton)`
  left: 20px;
`;

const RedoButton = styled(ActionButton)`
  right: 20px;
`;

// Вспомогательные функции
const shuffleTurnsOrder = (arr) => arr.concat(arr.splice(0, 1));

const initialColors = shuffleArray([
  '#7975b9',
  '#007F73',
  '#FB9AD1',
  '#FFC470',
  '#C5FF95',
  '#4793AF',
  '#ff7171',
]);

// Основной компонент Game
const Game = ({ map }) => {
  const [teams, setTeams] = React.useState([]);
  const [gameState, setGameState] = React.useState('prepare');
  const [turnsOrder, setTurnsOrder] = React.useState([]);
  const [currentTurn, setCurrentTurn] = React.useState(null);
  const [roundNumber, setRoundNumber] = React.useState(0);
  const [activeTeam, setActiveTeam] = React.useState(null);
  const [pendingCaptureZone, setPendingCaptureZone] = React.useState(null);
  const [captureState, setCaptureState] = React.useState({
    attackerAnswered: false,
    defenderAnswered: false,
    attackerCorrect: null,
    defenderCorrect: null,
    firstResponder: null,
    isNeutral: false,
    attackerAnswer: null,
    defenderAnswer: null,
    responseOrder: [],
  });
  
  const [availableColors, setAvailableColors] = React.useState([...initialColors]);

  // Состояния для undo/redo
  const [history, setHistory] = React.useState([]);
  const [future, setFuture] = React.useState([]);

  // Функция для сохранения текущего состояния
  const saveState = React.useCallback(() => {
    return {
      teams: JSON.parse(JSON.stringify(teams)),
      gameState,
      turnsOrder: [...turnsOrder],
      currentTurn,
      roundNumber,
      activeTeam,
      availableColors: [...availableColors]
    };
  }, [teams, gameState, turnsOrder, currentTurn, roundNumber, activeTeam, availableColors]);

  // Функция для загрузки состояния
  const loadState = React.useCallback((state) => {
    setTeams(state.teams);
    setGameState(state.gameState);
    setTurnsOrder(state.turnsOrder);
    setCurrentTurn(state.currentTurn);
    setRoundNumber(state.roundNumber);
    setActiveTeam(state.activeTeam);
    setAvailableColors(state.availableColors);
    
    // Сбрасываем временные состояния
    setPendingCaptureZone(null);
    setCaptureState({
      attackerAnswered: false,
      defenderAnswered: false,
      attackerCorrect: null,
      defenderCorrect: null,
      firstResponder: null,
      isNeutral: false,
      attackerAnswer: null,
      defenderAnswer: null,
      responseOrder: [],
    });
  }, []);

  // Функция для сохранения состояния в историю перед действием
  const saveToHistory = React.useCallback(() => {
    const currentState = saveState();
    setHistory(prev => [...prev, currentState]);
    setFuture([]); // Очищаем будущие состояния при новом действии
  }, [saveState]);

  // Функция отката действия
  const undo = React.useCallback(() => {
    if (history.length === 0) return;
    
    const currentState = saveState();
    const previousState = history[history.length - 1];
    
    setFuture(prev => [currentState, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    
    loadState(previousState);
  }, [history, saveState, loadState]);

  // Функция повтора действия
  const redo = React.useCallback(() => {
    if (future.length === 0) return;
    
    const nextState = future[0];
    
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, saveState()]);
    
    loadState(nextState);
  }, [future, saveState, loadState]);

  // Получаем basePositions из teams
  const basePositions = React.useMemo(() => {
    return teams.map(team => team.base).filter(Boolean);
  }, [teams]);

  const setBase = React.useCallback(
    (zoneId, teamIndex) => {
      saveToHistory();
      const newTeams = [...teams];
      newTeams[teamIndex].base = zoneId;
      setTeams(newTeams);
    },
    [teams, saveToHistory]
  );

  const toggleZoneToTeam = React.useCallback(
    (zoneId, teamIndex) => {
      saveToHistory();
      const newTeams = [...teams];

      const currentTeamHasZone = newTeams[teamIndex].zones.includes(zoneId);
      
      if (currentTeamHasZone) {
        newTeams[teamIndex].zones = newTeams[teamIndex].zones.filter((z) => z !== zoneId);
        
        if (newTeams[teamIndex].base === zoneId) {
          newTeams[teamIndex].base = null;
        }
      } else {
        for (let i = 0; i < newTeams.length; i++) {
          if (newTeams[i].zones.includes(zoneId)) {
            newTeams[i].zones = newTeams[i].zones.filter((z) => z !== zoneId);
            
            if (newTeams[i].base === zoneId) {
              newTeams[i].base = null;
            }
            break;
          }
        }
        
        newTeams[teamIndex].zones.push(zoneId);
        
        if (gameState === 'prepare' && !newTeams[teamIndex].base) {
          newTeams[teamIndex].base = zoneId;
        }
      }

      setTeams(newTeams);
    },
    [teams, gameState, saveToHistory]
  );

  const onTurnComplete = React.useCallback(() => {
    saveToHistory();
    const nextTeam = turnsOrder
      .slice(currentTurn + 1)
      .find((teamIndex) => teams[teamIndex].zones.length > 0);

    if (typeof nextTeam !== 'undefined') {
      setCurrentTurn(currentTurn + 1);
      setActiveTeam(nextTeam);
      return;
    }

    setRoundNumber(roundNumber + 1);
    setCurrentTurn(0);

    const newTurnsOrder = shuffleTurnsOrder(
      [...turnsOrder]
        .map((teamIndex) => (teams[teamIndex].zones.length > 0 ? teamIndex : undefined))
        .filter((i) => typeof i !== 'undefined')
    );

    setTurnsOrder(newTurnsOrder);
    setActiveTeam(newTurnsOrder[0]);
  }, [currentTurn, roundNumber, teams, turnsOrder, saveToHistory]);

  const maybeResolveCapture = React.useCallback(
    (state, zoneId) => {
      if (!state.attackerAnswered || !state.defenderAnswered) return;

      const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
      const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
      if (!zoneOwner || zoneOwnerId === -1) {
        return;
      }

      let winner = 'defender';

      if (!state.attackerCorrect && !state.defenderCorrect) {
        winner = 'defender';
      } else if (state.attackerCorrect && !state.defenderCorrect) {
        winner = 'attacker';
      } else if (!state.attackerCorrect && state.defenderCorrect) {
        winner = 'defender';
      } else if (state.attackerCorrect && state.defenderCorrect) {
        winner = state.responseOrder[0] === 'attacker' ? 'attacker' : 'defender';
      }

      const newTeams = [...teams];

      if (winner === 'attacker' && zoneOwnerId !== activeTeam) {
        if (zoneOwner.base === zoneId) {
          newTeams[activeTeam].score += 400;

          const zonesToCapture = [...newTeams[zoneOwnerId].zones];
          zonesToCapture.forEach((zone) => {
            if (zone !== zoneId) {
              newTeams[zoneOwnerId].zones = newTeams[zoneOwnerId].zones.filter(z => z !== zone);
              if (!newTeams[activeTeam].zones.includes(zone)) {
                newTeams[activeTeam].zones.push(zone);
              }
            }
          });
          
          newTeams[zoneOwnerId].base = null;
          
          newTeams[zoneOwnerId].zones = newTeams[zoneOwnerId].zones.filter(z => z !== zoneId);
          newTeams[activeTeam].zones.push(zoneId);
          newTeams[activeTeam].base = zoneId;
        } else {
          newTeams[activeTeam].score += 100;
          newTeams[zoneOwnerId].zones = newTeams[zoneOwnerId].zones.filter(z => z !== zoneId);
          newTeams[activeTeam].zones.push(zoneId);
        }
      }

      setTeams(newTeams);
      setPendingCaptureZone(null);
      setCaptureState({
        attackerAnswered: false,
        defenderAnswered: false,
        attackerCorrect: null,
        defenderCorrect: null,
        firstResponder: null,
        isNeutral: false,
        attackerAnswer: null,
        defenderAnswer: null,
        responseOrder: [],
      });
      onTurnComplete();
    },
    [activeTeam, onTurnComplete, teams]
  );

  const cancelCapture = React.useCallback(() => {
    setPendingCaptureZone(null);
    setCaptureState({
      attackerAnswered: false,
      defenderAnswered: false,
      attackerCorrect: null,
      defenderCorrect: null,
      firstResponder: null,
      isNeutral: false,
      attackerAnswer: null,
      defenderAnswer: null,
      responseOrder: [],
    });
  }, []);

  const onZoneClick = React.useCallback(
    (zoneId, isRightClick) => {
      if (gameState === 'prepare' && activeTeam !== null) {
        toggleZoneToTeam(zoneId, activeTeam);
      }
      if (gameState === 'started') {
        const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
        const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
        const newTeams = [...teams];

        if (isRightClick) {
          if (!zoneOwner || zoneOwnerId === activeTeam) return;

          saveToHistory();
          if (zoneOwner && zoneOwner.base === zoneId) {
            newTeams[zoneOwnerId].score += 200;
          } else {
            newTeams[zoneOwnerId].score += 100;
          }
          setTeams(newTeams);
          onTurnComplete();
        }
        if (!isRightClick) {
          if (!zoneOwner) {
            setPendingCaptureZone(zoneId);
            setCaptureState({
              attackerAnswered: false,
              defenderAnswered: false,
              attackerCorrect: null,
              defenderCorrect: null,
              firstResponder: null,
              isNeutral: true,
              attackerAnswer: null,
              defenderAnswer: null,
              responseOrder: [],
            });
            return;
          }

          if (zoneOwnerId === activeTeam) {
            return;
          }

          setPendingCaptureZone(zoneId);
          setCaptureState({
            attackerAnswered: false,
            defenderAnswered: false,
            attackerCorrect: null,
            defenderCorrect: null,
            firstResponder: null,
            isNeutral: false,
            attackerAnswer: null,
            defenderAnswer: null,
            responseOrder: [],
          });
        }
      }
    },
    [activeTeam, gameState, onTurnComplete, teams, toggleZoneToTeam, saveToHistory]
  );

  const handleAttackerAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;
      
      if (captureState.isNeutral) {
        saveToHistory();
        if (captureState.attackerAnswer === isCorrect) {
          setCaptureState(prev => ({
            ...prev,
            attackerAnswer: null,
            responseOrder: prev.responseOrder.filter(item => item !== 'attacker')
          }));
          return;
        }

        const newTeams = [...teams];
        if (isCorrect) {
          newTeams[activeTeam].score += 100;
          if (!newTeams[activeTeam].zones.includes(pendingCaptureZone)) {
            newTeams[activeTeam].zones.push(pendingCaptureZone);
          }
        }
        setTeams(newTeams);
        setPendingCaptureZone(null);
        setCaptureState({
          attackerAnswered: false,
          defenderAnswered: false,
          attackerCorrect: null,
          defenderCorrect: null,
          firstResponder: null,
          isNeutral: false,
          attackerAnswer: null,
          defenderAnswer: null,
          responseOrder: [],
        });
        onTurnComplete();
        return;
      }

      setCaptureState((prev) => {
        if (prev.attackerAnswer === isCorrect) {
          return {
            ...prev,
            attackerAnswer: null,
            attackerAnswered: false,
            responseOrder: prev.responseOrder.filter(item => item !== 'attacker')
          };
        }

        const newResponseOrder = [...prev.responseOrder];
        if (!newResponseOrder.includes('attacker')) {
          newResponseOrder.push('attacker');
        }

        const next = {
          ...prev,
          attackerAnswer: isCorrect,
          attackerAnswered: true,
          attackerCorrect: isCorrect,
          responseOrder: newResponseOrder,
        };
        
        if (next.attackerAnswered && next.defenderAnswered) {
          saveToHistory();
          maybeResolveCapture(next, pendingCaptureZone);
        }
        return next;
      });
    },
    [captureState.isNeutral, captureState.attackerAnswer, maybeResolveCapture, onTurnComplete, pendingCaptureZone, activeTeam, teams, saveToHistory]
  );

  const handleDefenderAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;
      
      setCaptureState((prev) => {
        if (prev.defenderAnswer === isCorrect) {
          return {
            ...prev,
            defenderAnswer: null,
            defenderAnswered: false,
            responseOrder: prev.responseOrder.filter(item => item !== 'defender')
          };
        }

        const newResponseOrder = [...prev.responseOrder];
        if (!newResponseOrder.includes('defender')) {
          newResponseOrder.push('defender');
        }

        const next = {
          ...prev,
          defenderAnswer: isCorrect,
          defenderAnswered: true,
          defenderCorrect: isCorrect,
          responseOrder: newResponseOrder,
        };
        
        if (next.attackerAnswered && next.defenderAnswered) {
          saveToHistory();
          maybeResolveCapture(next, pendingCaptureZone);
        }
        return next;
      });
    },
    [maybeResolveCapture, pendingCaptureZone, saveToHistory]
  );

  const getOrderForPlayer = (player, isActive) => {
    if (!isActive) return '';
    const index = captureState.responseOrder.indexOf(player);
    return index !== -1 ? (index + 1).toString() : '';
  };

  return (
    <GameContainer>
      <Map
        teams={teams}
        basePositions={basePositions}
        gameState={gameState}
        disabledZones={
          gameState === 'prepare' && activeTeam !== null
            ? map.getAdjucentZones(
                teams.filter((_, index) => index !== activeTeam).flatMap((team) => team.zones)
              )
            : []
        }
        onZoneClick={onZoneClick}
      />
      <GameControls
        teams={teams}
        activeTeam={activeTeam}
        onTeamAdded={(teamName) => {
          saveToHistory();
          const color = availableColors[availableColors.length - 1];
          const newAvailableColors = availableColors.slice(0, -1);
          
          const newTeams = [
            ...teams,
            {
              name: teamName,
              score: 1000,
              zones: [],
              color: color,
              base: null,
            },
          ];
          setTeams(newTeams);
          setAvailableColors(newAvailableColors);
        }}
        onTeamClick={(teamIndex) => {
          if (gameState === 'prepare') {
            setActiveTeam(teamIndex === activeTeam ? null : teamIndex);
          }
        }}
        onGameStart={() => {
          saveToHistory();
          setGameState('started');
          setCurrentTurn(0);
          setRoundNumber(1);
          setTurnsOrder(teams.map((tmp, index) => index));
          setActiveTeam(0);
        }}
        onTurnComplete={onTurnComplete}
        gameState={gameState}
        currentTurn={turnsOrder[currentTurn]}
        roundNumber={roundNumber}
      />
      
      <UndoButton 
        disabled={history.length === 0}
        onClick={undo}
        title={history.length === 0 ? "Нет действий для отмены" : "Отменить последнее действие"}
      >
        <img src="/images/undo-icon.png" alt="Отменить" />
      </UndoButton>
      
      <RedoButton 
        disabled={future.length === 0}
        onClick={redo}
        title={future.length === 0 ? "Нет действий для повтора" : "Повторить отмененное действие"}
      >
        <img src="/images/redo-icon.png" alt="Повторить" />
      </RedoButton>
      
      {pendingCaptureZone && (
        <CaptureModalBackdrop>
          <CaptureModalCard>
            <CaptureModalTitle>
              Захватить зону {pendingCaptureZone}?
            </CaptureModalTitle>
            <CaptureModalText>
              {captureState.isNeutral 
                ? 'Захват нейтральной территории. Выполните задание и выберите результат.' 
                : 'Захват вражеской территории. Здесь будет описание задания или подсказка для игрока. После выполнения задания выберите результат атаки для атакующих и защищающихся.'}
            </CaptureModalText>
            <CaptureModalImagePlaceholder>
              Image placeholder
            </CaptureModalImagePlaceholder>
            <CaptureModalActions>
              {captureState.isNeutral ? (
                <CaptureModalColumn style={{ margin: '0 auto' }}>
                  <CaptureButton
                    className={`confirm ${captureState.attackerAnswer === true ? 'active' : ''}`}
                    onClick={() => handleAttackerAnswer(true)}
                    data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === true)}
                  >
                    <img src="/images/success-icon.png" alt="Успешно" />
                  </CaptureButton>
                  <CaptureButton
                    className={`cancel ${captureState.attackerAnswer === false ? 'active' : ''}`}
                    onClick={() => handleAttackerAnswer(false)}
                    data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === false)}
                  >
                    <img src="/images/fail-icon.png" alt="Неуспешно" />
                  </CaptureButton>
                </CaptureModalColumn>
              ) : (
                <>
                  <CaptureModalColumn>
                    <CaptureButton
                      className={`confirm ${captureState.attackerAnswer === true ? 'active' : ''}`}
                      onClick={() => handleAttackerAnswer(true)}
                      data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === true)}
                    >
                      <img src="/images/attack-correct-icon.png" alt="Атакующие верно" />
                    </CaptureButton>
                    <CaptureButton
                      className={`cancel ${captureState.attackerAnswer === false ? 'active' : ''}`}
                      onClick={() => handleAttackerAnswer(false)}
                      data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === false)}
                    >
                      <img src="/images/attack-wrong-icon.png" alt="Атакующие неверно" />
                    </CaptureButton>
                  </CaptureModalColumn>
                  <CaptureModalColumn>
                    <CaptureButton
                      className={`confirm-alt ${captureState.defenderAnswer === true ? 'active' : ''}`}
                      onClick={() => handleDefenderAnswer(true)}
                      data-order={getOrderForPlayer('defender', captureState.defenderAnswer === true)}
                    >
                      <img src="/images/defend-correct-icon.png" alt="Защищающиеся верно" />
                    </CaptureButton>
                    <CaptureButton
                      className={`cancel-alt ${captureState.defenderAnswer === false ? 'active' : ''}`}
                      onClick={() => handleDefenderAnswer(false)}
                      data-order={getOrderForPlayer('defender', captureState.defenderAnswer === false)}
                    >
                      <img src="/images/defend-wrong-icon.png" alt="Защищающиеся неверно" />
                    </CaptureButton>
                  </CaptureModalColumn>
                </>
              )}
            </CaptureModalActions>
          </CaptureModalCard>
        </CaptureModalBackdrop>
      )}
    </GameContainer>
  );
};

export default Game;