import { useParams, Navigate } from 'react-router-dom';
import GamePlayPage from './GamePlayPage';

// Valid game slugs - matches the games in the database
const VALID_GAMES = ['future-snake', 'pong', 'tic-tac-toe'];

export default function ValidatedGamePlayPage() {
  const { gameSlug } = useParams();

  // Validate that the game exists - show 404 for invalid games
  if (!gameSlug || !VALID_GAMES.includes(gameSlug)) {
    return <Navigate to="/404" replace />;
  }

  return <GamePlayPage />;
}
