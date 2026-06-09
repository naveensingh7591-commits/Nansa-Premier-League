import React from 'react';
import Hero from '../components/Hero';
import NoticeBoard from '../components/NoticeBoard';
import TournamentOverview from '../components/TournamentOverview';
import Fixtures from '../components/Fixtures';
import SeasonsArchive from '../components/SeasonsArchive';
import Gallery from '../components/Gallery';
import Tribute from '../components/Tribute';
import Organizers from '../components/Organizers';
import Officials from '../components/Officials';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <NoticeBoard />
      <TournamentOverview />
      <Fixtures />
      <Officials />
      <SeasonsArchive />
      <Gallery />
      <Tribute />
      <Organizers />
    </div>
  );
};

export default Home;
