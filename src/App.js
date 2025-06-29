import './App.css';
import Header from './components/Header/Header'
import Recent from './components/Recent/Recent'
import Podcasts from './components/Podcasts/Podcasts'
import Player from './components/Player/Player'

function App() {
  return (
    <div className="App">
      <div className='container'>
        <Header />
        <Recent />
        <Podcasts />
      </div>
      <Player />
    </div>
  );
}

export default App;
