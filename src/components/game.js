import * as React from 'react';
import styled from 'styled-components';
import GameControls from "./game-controls";
import Map from "./map";
import {shuffleArray} from "../logic/utils";

const GameContainer = styled.div`
    display: flex;
    gap: 10px;
    padding: 10px;
    
    // height fix
    height: calc(100% - 20px);
`;

const shuffleTurnsOrder = arr => arr.concat(arr.splice(0, 1));

const availableColors = shuffleArray([
    '#7975b9',
    '#007F73',
    '#FB9AD1',
    '#FFC470',
    '#C5FF95',
    '#4793AF',
    '#ff7171'
]);

const Game = ({ map }) => {
    const [teams, setTeams] = React.useState([]);
    const [basePositions, setBasePositions] = React.useState([]);
    const [gameState, setGameState] = React.useState('prepare');
    const [turnsOrder, setTurnsOrder] = React.useState([]);
    const [currentTurn, setCurrentTurn] = React.useState(null);
    const [roundNumber, setRoundNumber] = React.useState(0);
    const [activeTeam, setActiveTeam] = React.useState(null);

    const setBase = React.useCallback((zoneId, teamIndex) => {
        const newBasePositions = [...basePositions, zoneId];
        const newTeams = [...teams];
        newTeams[teamIndex].base = zoneId;

        setBasePositions(newBasePositions);
        setTeams(newTeams)
    }, [basePositions, teams]);

    const toggleZoneToTeam = React.useCallback((zoneId, teamIndex) => {
        let shouldCleanupBase = true;
        const newTeams = [...teams];

        if (teams[teamIndex].zones.includes(zoneId)) {
            newTeams[teamIndex].zones = newTeams[teamIndex].zones.filter(z => z !== zoneId);

            if (newTeams[teamIndex].base === zoneId) {
                newTeams[teamIndex].base = null;
            }
        } else {
            // Remove the zone from the previous owner
            const prevOwner = newTeams.find(team => team.zones.includes(zoneId));
            if (prevOwner) {
                prevOwner.zones = prevOwner.zones.filter(z => z !== zoneId);
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
            setBasePositions(basePositions.filter(z => z !== zoneId));
        }

        setTeams(newTeams);
    }, [activeTeam, basePositions, gameState, setBase, teams]);

    const onTurnComplete = React.useCallback(() => {
        const nextTeam = turnsOrder.slice(currentTurn + 1).find(teamIndex => teams[teamIndex].zones.length > 0);

        if (typeof nextTeam !== 'undefined') {
            setCurrentTurn(currentTurn + 1);
            setActiveTeam(nextTeam);
            return;
        }

        setRoundNumber(roundNumber + 1);
        setCurrentTurn(0);

        const newTurnsOrder = shuffleTurnsOrder([
            ...turnsOrder
                .map(teamIndex => teams[teamIndex].zones.length > 0 ? teamIndex : undefined)
                .filter(i => typeof i !== 'undefined'),
        ]);

        setTurnsOrder(newTurnsOrder);
        setActiveTeam(newTurnsOrder[0]);
    }, [currentTurn, roundNumber, teams, turnsOrder]);

    const onZoneClick = React.useCallback((zoneId, isRightClick) => {
        if (gameState === 'prepare' && activeTeam !== null) {
            toggleZoneToTeam(zoneId, activeTeam);
        }
        if (gameState === 'started') {
            const zoneOwner = teams.find(team => team.zones.includes(zoneId));
            const zoneOwnerId = teams.findIndex(team => team.zones.includes(zoneId));
            const newTeams = [...teams];

            if (isRightClick) {
                if (!zoneOwner || zoneOwnerId === activeTeam) return;

                if (zoneOwner && zoneOwner.base === zoneId && basePositions.includes(zoneId)) {
                    newTeams[zoneOwnerId].score += 200;
                } else {
                    newTeams[zoneOwnerId].score += 100;
                }
            }
            if (!isRightClick && zoneOwnerId !== activeTeam) {
                if (zoneOwner && zoneOwner.base === zoneId && basePositions.includes(zoneId)) {
                    newTeams[activeTeam].score += 400;

                    newTeams[zoneOwnerId].zones.forEach(zone => toggleZoneToTeam(zone, activeTeam));
                    newTeams[zoneOwnerId].base = null;
                    setBasePositions(basePositions.filter(z => z !== zoneId));
                } else {
                    newTeams[activeTeam].score += 100;
                    toggleZoneToTeam(zoneId, activeTeam);
                }
            }

            setTeams(newTeams);
            onTurnComplete();
        }
    }, [activeTeam, basePositions, gameState, onTurnComplete, teams, toggleZoneToTeam]);

    return <GameContainer>
        <Map
            teams={teams}
            basePositions={basePositions}
            gameState={gameState}
            disabledZones={gameState === 'prepare' && activeTeam !== null
                ? map.getAdjucentZones(teams.filter((_, index) => index !== activeTeam).flatMap(team => team.zones))
                : []}
            onZoneClick={onZoneClick}
        />
        <GameControls
            teams={teams}
            activeTeam={activeTeam}
            onTeamAdded={teamName => {
                setTeams([...teams, {
                    name: teamName,
                    score: 1000,
                    zones: [],
                    color: availableColors.pop()
                }]);
            }}
            onTeamClick={teamIndex => {
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
    </GameContainer>
};

export default Game;