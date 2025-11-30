import * as React from 'react';
import styled from 'styled-components';
import GameControls from './game-controls';
import Map from './map';
import { shuffleArray } from '../logic/utils';

const GameContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;

  // height fix
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
  min-width: 230px;
  padding: 16px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.05s ease-in-out, box-shadow 0.05s ease-in-out,
    background-color 0.1s ease-in-out, filter 0.1s ease-in-out;

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
    color: #222;
  }

  &.confirm {
    background: #16a34a;
    color: #fff;
  }

  &.confirm-alt {
    background: #22c55e;
    color: #fff;
  }

  &.cancel-alt {
    background: #f97316;
    color: #fff;
  }
`;

const CaptureModalColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const shuffleTurnsOrder = (arr) => arr.concat(arr.splice(0, 1));

const availableColors = shuffleArray([
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
  const [basePositions, setBasePositions] = React.useState([]);
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
  });

  const setBase = React.useCallback(
    (zoneId, teamIndex) => {
      const newBasePositions = [...basePositions, zoneId];
      const newTeams = [...teams];
      newTeams[teamIndex].base = zoneId;

      setBasePositions(newBasePositions);
      setTeams(newTeams);
    },
    [basePositions, teams]
  );

  const toggleZoneToTeam = React.useCallback(
    (zoneId, teamIndex) => {
      let shouldCleanupBase = true;
      const newTeams = [...teams];

      if (teams[teamIndex].zones.includes(zoneId)) {
        newTeams[teamIndex].zones = newTeams[teamIndex].zones.filter((z) => z !== zoneId);

        if (newTeams[teamIndex].base === zoneId) {
          newTeams[teamIndex].base = null;
        }
      } else {
        // Remove the zone from the previous owner
        const prevOwner = newTeams.find((team) => team.zones.includes(zoneId));
        if (prevOwner) {
          prevOwner.zones = prevOwner.zones.filter((z) => z !== zoneId);
        }

        // Set the base if preparing
        if (gameState === 'prepare' && !newTeams[activeTeam].base) {
          console.log('set base', zoneId);
          setBase(zoneId, activeTeam);
          shouldCleanupBase = false;
        }

        newTeams[teamIndex].zones.push(zoneId);
      }

      // Destroy the base
      if (shouldCleanupBase) {
        setBasePositions(basePositions.filter((z) => z !== zoneId));
      }

      setTeams(newTeams);
    },
    [activeTeam, basePositions, gameState, setBase, teams]
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
        toggleZoneToTeam(zoneId, activeTeam);
      }
      if (gameState === 'started') {
        const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
        const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
        const newTeams = [...teams];

        if (isRightClick) {
          if (!zoneOwner || zoneOwnerId === activeTeam) return;

          if (zoneOwner && zoneOwner.base === zoneId && basePositions.includes(zoneId)) {
            newTeams[zoneOwnerId].score += 200;
          } else {
            newTeams[zoneOwnerId].score += 100;
          }
          setTeams(newTeams);
          onTurnComplete();
        }
        if (!isRightClick) {
          // neutral tile: immediate capture as before
          if (!zoneOwner) {
            newTeams[activeTeam].score += 100;
            toggleZoneToTeam(zoneId, activeTeam);
            setTeams(newTeams);
            onTurnComplete();
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
          });
        }
      }
    },
    [activeTeam, basePositions, gameState, onTurnComplete, teams, toggleZoneToTeam]
  );

  const cancelCapture = React.useCallback(() => {
    setPendingCaptureZone(null);
    setCaptureState({
      attackerAnswered: false,
      defenderAnswered: false,
      attackerCorrect: null,
      defenderCorrect: null,
      firstResponder: null,
    });
  }, []);

  const maybeResolveCapture = React.useCallback(
    (state, zoneId) => {
      if (!state.attackerAnswered || !state.defenderAnswered) return;

      const zoneOwner = teams.find((team) => team.zones.includes(zoneId));
      const zoneOwnerId = teams.findIndex((team) => team.zones.includes(zoneId));
      if (!zoneOwner || zoneOwnerId === -1) {
        // fallback: no defender, attacker wins on correct
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
        winner = state.firstResponder === 'attacker' ? 'attacker' : 'defender';
      }

      const newTeams = [...teams];

      if (winner === 'attacker' && zoneOwnerId !== activeTeam) {
        if (zoneOwner.base === zoneId && basePositions.includes(zoneId)) {
          newTeams[activeTeam].score += 400;

          newTeams[zoneOwnerId].zones.forEach((zone) => toggleZoneToTeam(zone, activeTeam));
          newTeams[zoneOwnerId].base = null;
          setBasePositions(basePositions.filter((z) => z !== zoneId));
        } else {
          newTeams[activeTeam].score += 100;
          toggleZoneToTeam(zoneId, activeTeam);
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
      });
      onTurnComplete();
    },
    [activeTeam, basePositions, onTurnComplete, teams, toggleZoneToTeam]
  );

  const handleAttackerAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;
      setCaptureState((prev) => {
        if (prev.attackerAnswered) return prev;
        const next = {
          ...prev,
          attackerAnswered: true,
          attackerCorrect: isCorrect,
          firstResponder: prev.firstResponder || 'attacker',
        };
        maybeResolveCapture(next, pendingCaptureZone);
        return next;
      });
    },
    [maybeResolveCapture, pendingCaptureZone]
  );

  const handleDefenderAnswer = React.useCallback(
    (isCorrect) => {
      if (!pendingCaptureZone) return;
      setCaptureState((prev) => {
        if (prev.defenderAnswered) return prev;
        const next = {
          ...prev,
          defenderAnswered: true,
          defenderCorrect: isCorrect,
          firstResponder: prev.firstResponder || 'defender',
        };
        maybeResolveCapture(next, pendingCaptureZone);
        return next;
      });
    },
    [maybeResolveCapture, pendingCaptureZone]
  );

  const attackerOrderLabel =
    captureState.firstResponder === 'attacker'
      ? '1'
      : captureState.firstResponder === 'defender' && captureState.attackerAnswered
      ? '2'
      : '';

  const defenderOrderLabel =
    captureState.firstResponder === 'defender'
      ? '1'
      : captureState.firstResponder === 'attacker' && captureState.defenderAnswered
      ? '2'
      : '';

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
          setTeams([
            ...teams,
            {
              name: teamName,
              score: 1000,
              zones: [],
              color: availableColors.pop(),
            },
          ]);
        }}
        onTeamClick={(teamIndex) => {
          if (gameState === 'prepare') {
            setActiveTeam(teamIndex === activeTeam ? null : teamIndex);
          }
        }}
        onGameStart={() => {
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
      {pendingCaptureZone && (
        <CaptureModalBackdrop>
          <CaptureModalCard>
            <CaptureModalTitle>Захватить зону {pendingCaptureZone}?</CaptureModalTitle>
            <CaptureModalText>
              Здесь будет описание задания или подсказка для игрока. После выполнения
              задания выберите результат атаки для атакующих и защищающихся.
            </CaptureModalText>
            <CaptureModalImagePlaceholder>
              Image placeholder
            </CaptureModalImagePlaceholder>
            <CaptureModalActions>
              <CaptureModalColumn>
                <CaptureButton
                  className="confirm"
                  data-order={attackerOrderLabel || ''}
                  onClick={() => handleAttackerAnswer(true)}
                >
                  Атакующие-верно
                </CaptureButton>
                <CaptureButton
                  className="cancel"
                  data-order=""
                  onClick={() => handleAttackerAnswer(false)}
                >
                  Актакующие-неверно
                </CaptureButton>
              </CaptureModalColumn>
              <CaptureModalColumn>
                <CaptureButton
                  className="confirm-alt"
                  data-order={defenderOrderLabel || ''}
                  onClick={() => handleDefenderAnswer(true)}
                >
                  Защищающиеся - верно
                </CaptureButton>
                <CaptureButton
                  className="cancel-alt"
                  data-order=""
                  onClick={() => handleDefenderAnswer(false)}
                >
                  Защищающиеся- неверно
                </CaptureButton>
              </CaptureModalColumn>
            </CaptureModalActions>
          </CaptureModalCard>
        </CaptureModalBackdrop>
      )}
    </GameContainer>
  );
};

export default Game;


