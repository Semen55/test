import * as React from 'react';
import styled from 'styled-components';

import logo from '../logo.svg';
import Game from './game';
import mapJson from './assets/map1.json';
import Graph from '../logic/graph';

const PageContainer = styled.div`
  background: -webkit-linear-gradient(
    top,
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.85)
  );
  height: 100vh;
`;

const TopBar = styled.div`
  position: absolute;
  top: 10px;
  height: 70px;
  padding: 5px 40px;
`;

const FestLogo = styled.img`
  height: 60px;
`;

const Page = () => {
  const map = new Graph(mapJson);

  return (
    <PageContainer>
      <TopBar>
        <FestLogo src={logo} className="logo" alt="logo" />
      </TopBar>
      <Game map={map} />
    </PageContainer>
  );
};

export default Page;


