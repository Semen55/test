import * as React from 'react';
import styled from 'styled-components';
import GameControls from './game-controls';
import Map from './map';
import { shuffleArray } from '../logic/utils';

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
  border: 4px solid #000;
  border-radius: 0;
  padding: 0;
  width: 90%;
  max-width: 1000px;
  height: auto;
  min-height: 500px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: visible;
`;

const CaptureModalContent = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CaptureModalImagePlaceholder = styled.div`
  width: 100%;
  max-width: 600px;
  height: 300px;
  border: 2px solid #333;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 14px;
  margin-top: 20px;
`;

const CaptureModalTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: normal;
  text-transform: uppercase;
`;

const CaptureModalText = styled.p`
  margin: 0 0 20px;
  font-size: 18px;
  line-height: 1.5;
  color: #000;
  max-width: 800px;
`;

const CaptureModalSideActions = styled.div`
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  
  &.left {
    border-right: none;
  }
  
  &.right {
    border-left: none;
  }
`;

const CaptureButton = styled.button`
  position: relative;
  width: 80px;
  height: 80px;
  padding: 0;
  border-radius: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: attr(data-order);
    position: absolute;
    top: -5px;
    right: -5px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #000;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => props['data-order'] ? 1 : 0};
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));
    transform: scale(1.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
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

  // History state
  const [history, setHistory] = React.useState([]);
  const [future, setFuture] = React.useState([]);

  const recordAction = React.useCallback(() => {
    const currentState = {
      teams: JSON.parse(JSON.stringify(teams)),
      gameState,
      turnsOrder: [...turnsOrder],
      currentTurn,
      roundNumber,
      activeTeam,
      availableColors: [...availableColors],
    };
    setHistory((prev) => [...prev, currentState]);
    setFuture([]);
  }, [teams, gameState, turnsOrder, currentTurn, roundNumber, activeTeam, availableColors]);

  const restoreState = React.useCallback((state) => {
    setTeams(state.teams);
    setGameState(state.gameState);
    setTurnsOrder(state.turnsOrder);
    setCurrentTurn(state.currentTurn);
    setRoundNumber(state.roundNumber);
    setActiveTeam(state.activeTeam);
    setAvailableColors(state.availableColors);

    // Reset UI states
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

  const undo = React.useCallback(() => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    const currentState = {
      teams: JSON.parse(JSON.stringify(teams)),
      gameState,
      turnsOrder: [...turnsOrder],
      currentTurn,
      roundNumber,
      activeTeam,
      availableColors: [...availableColors],
    };

    setFuture((prev) => [currentState, ...prev]);
    setHistory(newHistory);
    restoreState(previousState);
  }, [history, teams, gameState, turnsOrder, currentTurn, roundNumber, activeTeam, availableColors, restoreState]);

  const redo = React.useCallback(() => {
    if (future.length === 0) return;

    const nextState = future[0];
    const newFuture = future.slice(1);

    const currentState = {
      teams: JSON.parse(JSON.stringify(teams)),
      gameState,
      turnsOrder: [...turnsOrder],
      currentTurn,
      roundNumber,
      activeTeam,
      availableColors: [...availableColors],
    };

    setHistory((prev) => [...prev, currentState]);
    setFuture(newFuture);
    restoreState(nextState);
  }, [future, teams, gameState, turnsOrder, currentTurn, roundNumber, activeTeam, availableColors, restoreState]);

  // Получаем basePositions из teams
  const basePositions = React.useMemo(() => {
    return teams.map(team => team.base).filter(Boolean);
  }, [teams]);

  const setBase = React.useCallback(
    (zoneId, teamIndex) => {
      const newTeams = [...teams];
      newTeams[teamIndex].base = zoneId;
      setTeams(newTeams);
    },
    [teams]
  );

  const toggleZoneToTeam = React.useCallback(
    (zoneId, teamIndex) => {
      const newTeams = [...teams];

      // Проверяем, есть ли уже эта территория у команды
      const currentTeamHasZone = newTeams[teamIndex].zones.includes(zoneId);

      if (currentTeamHasZone) {
        // Убираем территорию у команды
        newTeams[teamIndex].zones = newTeams[teamIndex].zones.filter((z) => z !== zoneId);

        // Если это была столица, убираем и столицу
        if (newTeams[teamIndex].base === zoneId) {
          newTeams[teamIndex].base = null;
        }
      } else {
        // Убираем территорию у предыдущего владельца
        for (let i = 0; i < newTeams.length; i++) {
          if (newTeams[i].zones.includes(zoneId)) {
            newTeams[i].zones = newTeams[i].zones.filter((z) => z !== zoneId);

            // Если у предыдущего владельца это была столица, убираем столицу
            if (newTeams[i].base === zoneId) {
              newTeams[i].base = null;
            }
            break;
          }
        }

        // Добавляем территорию новой команде
        newTeams[teamIndex].zones.push(zoneId);

        // Если это первая территория в режиме подготовки, устанавливаем столицу
        if (gameState === 'prepare' && !newTeams[teamIndex].base) {
          newTeams[teamIndex].base = zoneId;
        }
      }

      setTeams(newTeams);
    },
    [teams, gameState]
  );

  const onTurnComplete = React.useCallback(() => {
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
  }, [currentTurn, roundNumber, teams, turnsOrder]);

  const onZoneClick = React.useCallback(
    (zoneId, isRightClick) => {
      if (gameState === 'prepare' && activeTeam !== null) {
        recordAction();
        toggleZoneToTeam(zoneId, activeTeam);
      }
      if (gameState === 'started') {
        const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
        const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
        const newTeams = [...teams];

        if (isRightClick) {
          if (!zoneOwner || zoneOwnerId === activeTeam) return;

          recordAction();
          if (zoneOwner && zoneOwner.base === zoneId) {
            newTeams[zoneOwnerId].score += 200;
          } else {
            newTeams[zoneOwnerId].score += 100;
          }
          setTeams(newTeams);
          onTurnComplete();
        }
        if (!isRightClick) {
          // neutral tile: open capture modal
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

          // own tile: ignore
          if (zoneOwnerId === activeTeam) {
            return;
          }

          // enemy tile: open confirmation window
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
    [activeTeam, gameState, onTurnComplete, teams, toggleZoneToTeam, recordAction]
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

  const maybeResolveCapture = React.useCallback(
    (state, zoneId) => {
      if (!state.attackerAnswered || !state.defenderAnswered) return;

      const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
      const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
      if (!zoneOwner || zoneOwnerId === -1) {
        return;
      }

      recordAction();

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

          // Capture all zones of the defeated team
          const zonesToCapture = [...newTeams[zoneOwnerId].zones];
          zonesToCapture.forEach((zone) => {
            if (zone !== zoneId) {
              // Remove from defeated team
              newTeams[zoneOwnerId].zones = newTeams[zoneOwnerId].zones.filter(z => z !== zone);
              // Add to attacker team
              if (!newTeams[activeTeam].zones.includes(zone)) {
                newTeams[activeTeam].zones.push(zone);
              }
            }
          });

          // Remove base from defeated team
          newTeams[zoneOwnerId].base = null;

          // Capture the base zone
          newTeams[zoneOwnerId].zones = newTeams[zoneOwnerId].zones.filter(z => z !== zoneId);
          newTeams[activeTeam].zones.push(zoneId);
          newTeams[activeTeam].base = zoneId;
        } else {
          newTeams[activeTeam].score += 100;
          // Remove from defender and add to attacker
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
    [activeTeam, onTurnComplete, teams, recordAction]
  );

  React.useEffect(() => {
    if (
      pendingCaptureZone &&
      !captureState.isNeutral &&
      captureState.attackerAnswered &&
      captureState.defenderAnswered
    ) {
      maybeResolveCapture(captureState, pendingCaptureZone);
    }
  }, [captureState, pendingCaptureZone, maybeResolveCapture]);

  const handleAttackerAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;

      // Для нейтральных территорий
      if (captureState.isNeutral) {
        // Если уже выбран этот вариант - отменяем выбор
        if (captureState.attackerAnswer === isCorrect) {
          setCaptureState(prev => ({
            ...prev,
            attackerAnswer: null,
            responseOrder: prev.responseOrder.filter(item => item !== 'attacker')
          }));
          return;
        }

        recordAction();
        const newTeams = [...teams];
        if (isCorrect) {
          newTeams[activeTeam].score += 100;
          // Добавляем территорию команде
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

      // Для вражеских территорий - переключаем выбор
      setCaptureState((prev) => {
        // Если уже выбран этот вариант - отменяем выбор
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

        return next;
      });
    },
    [captureState.isNeutral, captureState.attackerAnswer, onTurnComplete, pendingCaptureZone, activeTeam, teams, recordAction]
  );

  const handleDefenderAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;

      setCaptureState((prev) => {
        // Если уже выбран этот вариант - отменяем выбор
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

        return next;
      });
    },
    [pendingCaptureZone]
  );

  // Определяем порядок для отображения - теперь функция будет возвращать порядок только для активной кнопки
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
          const color = availableColors[availableColors.length - 1];
          const newAvailableColors = availableColors.slice(0, -1);

          recordAction();
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
            recordAction();
            setActiveTeam(teamIndex === activeTeam ? null : teamIndex);
          }
        }}
        onGameStart={() => {
          recordAction();
          setGameState('started');
          setCurrentTurn(0);
          setRoundNumber(1);
          setTurnsOrder(teams.map((tmp, index) => index));
          setActiveTeam(0);
        }}
        onTurnComplete={() => {
          recordAction();
          onTurnComplete();
        }}
        gameState={gameState}
        currentTurn={turnsOrder[currentTurn]}
        roundNumber={roundNumber}
      />

      {/* Кнопки Undo/Redo */}
      <UndoButton
        disabled={history.length === 0}
        onClick={undo}
        title="Отменить последнее действие"
      >
        <img src="/images/undo-icon.png" alt="Отменить" />
      </UndoButton>

      <RedoButton
        disabled={future.length === 0}
        onClick={redo}
        title="Повторить отмененное действие"
      >
        <img src="/images/redo-icon.png" alt="Повторить" />
      </RedoButton>

      {pendingCaptureZone && (
        <CaptureModalBackdrop>
          <CaptureModalCard>
            {/* Left Actions (Defender) */}
            <CaptureModalSideActions className="left">
              {!captureState.isNeutral && (
                <>
                  <CaptureButton
                    className={captureState.defenderAnswer === false ? 'active' : ''}
                    onClick={() => handleDefenderAnswer(false)}
                    data-order={getOrderForPlayer('defender', captureState.defenderAnswer === false)}
                  >
                    <img src="/images/defend-wrong-icon.png" alt="Защита неверно" />
                  </CaptureButton>
                  <CaptureButton
                    className={captureState.defenderAnswer === true ? 'active' : ''}
                    onClick={() => handleDefenderAnswer(true)}
                    data-order={getOrderForPlayer('defender', captureState.defenderAnswer === true)}
                  >
                    <img src="/images/defend-correct-icon.png" alt="Защита верно" />
                  </CaptureButton>
                </>
              )}
            </CaptureModalSideActions>

            {/* Center Content */}
            <CaptureModalContent>
              <CaptureModalTitle>
                РЕГИОН {pendingCaptureZone}
              </CaptureModalTitle>
              <CaptureModalText>
                {captureState.isNeutral
                  ? 'В комнате, имеющей форму прилегающих друг к другу квадратов со сторонами 5м, 7м и 10м (как показано на рисунке), решили покрасить пол в два разных цвета. На 1 кв.м пола расходуется 30г краски. Сколько краски уйдёт на то, чтобы покрасить отмеченную цветом часть пола?'
                  : 'Захват вражеской территории. Здесь будет описание задания или подсказка для игрока. После выполнения задания выберите результат атаки для атакующих и защищающихся.'}
              </CaptureModalText>
              <CaptureModalImagePlaceholder>
                Image placeholder
              </CaptureModalImagePlaceholder>
            </CaptureModalContent>

            {/* Right Actions (Attacker) */}
            <CaptureModalSideActions className="right">
              <CaptureButton
                className={captureState.attackerAnswer === false ? 'active' : ''}
                onClick={() => handleAttackerAnswer(false)}
                data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === false)}
              >
                <img src="/images/attack-wrong-icon.png" alt="Атака неверно" />
              </CaptureButton>
              <CaptureButton
                className={captureState.attackerAnswer === true ? 'active' : ''}
                onClick={() => handleAttackerAnswer(true)}
                data-order={getOrderForPlayer('attacker', captureState.attackerAnswer === true)}
              >
                <img src="/images/attack-correct-icon.png" alt="Атака верно" />
              </CaptureButton>
            </CaptureModalSideActions>
          </CaptureModalCard>
        </CaptureModalBackdrop>
      )}
    </GameContainer>
  );
};

export default Game;
