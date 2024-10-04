import React from 'react';

interface AuthMessageProps {
  isAuthenticated: boolean;
}

const AuthMessage: React.FC<AuthMessageProps> = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-blue-500 text-gray-800 p-6 mb-6 rounded-lg shadow-md" role="alert">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Welcome to Beat Battle!</h2>
      <div className="space-y-4">
        <p className="font-medium">
          Get ready for the ultimate song-matching showdown! 🎵🏆
        </p>
        <p>
          Discover your all-time favorite track by voting between two songs at a time. It's simple:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li>Each match pits two songs against each other</li>
          <li>Pick the one that resonates with you the most</li>
          <li>Over time, we'll help identify your ultimate favorite</li>
        </ul>
        <p className="font-medium text-purple-700">
          But wait, there's more! Your votes contribute to the community leaderboard.
        </p>
        <p>
          We're tracking everyone's picks to determine the overall users' favorite track. Whether it's a personal classic or a crowd-pleaser, Beat Battle will reveal which song rules them all!
        </p>
        <p className="font-bold text-blue-700">
          Ready to join the battle? Let's get started! 🚀
        </p>
      </div>
    </div>
  );
};

export default AuthMessage;