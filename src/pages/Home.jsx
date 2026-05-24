import React from 'react';
import Hero from '../components/Hero';
import TournamentOverview from '../components/TournamentOverview';
import SeasonsArchive from '../components/SeasonsArchive';
import Gallery from '../components/Gallery';
import Tribute from '../components/Tribute';
import Organizers from '../components/Organizers';
import Officials from '../components/Officials';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <TournamentOverview />
      <Officials />
      <SeasonsArchive />
      <Gallery />
      <Tribute />
      <Organizers />
      {/* Additional sections will be added here */}
    </div>
  );
};

export default Home;
