import * as React from 'react';
import styled, { css } from 'styled-components';
import { ReactComponent as MapSvg } from './assets/Map.svg';

const MapContainer = styled.div`
  background: #a1cef6;
  border-radius: 10px;
  width: 80%;
  height: 100%;

  svg {
    width: 100%;
    height: 100%;

    .zone {
      transition: all 0.1s ease-in-out;

      ${({ disableHover }) =>
        !disableHover &&
        css`
          &:hover {
            filter: contrast(0.8);
          }
        `}

      path {
        fill: #fff3dd;
      }

      ${({ zoneColors }) =>
        Object.entries(zoneColors).map(
          ([zoneId, color]) => css`
            &[data-name='zone_${zoneId}'] path {
              fill: ${color};
            }
          `
        )}

      ${({ disabledZones }) =>
        disabledZones.map(
          (zoneId) => css`
            &[data-name='base_${zoneId}'] path {
              fill: #666;
            }
          `
        )}
    }

    g.base {
      display: none;

      ${({ basePositions }) =>
        basePositions.map(
          (zoneId) => css`
            &[data-name='base_${zoneId}'] {
              display: block;

              path {
                fill: #000;
              }
            }
          `
        )}
    }
  }
`;

const Map = ({ teams, disabledZones, basePositions, onZoneClick }) => {
  const zoneColors = teams.reduce((acc, team) => {
    team.zones.forEach((zone) => {
      acc[zone] = team.color;
    });
    return acc;
  }, {});

  const handleClick = React.useCallback(
    (isRightClick) => (event) => {
      event.preventDefault();
      const parent = event.target.parentElement;
      if (!parent || !parent.dataset.name || !parent.dataset.name.split('_')[1]) return;

      console.log('Zone click: ', parent.dataset.name.split('_')[1], isRightClick);
      onZoneClick(parent.dataset.name.split('_')[1], isRightClick);
    },
    [onZoneClick]
  );

  return (
    <MapContainer
      zoneColors={zoneColors}
      basePositions={basePositions}
      disabledZones={disabledZones}
      disableHover={false}
    >
      <MapSvg onClick={handleClick(false)} onContextMenu={handleClick(true)} />
    </MapContainer>
  );
};

export default Map;


