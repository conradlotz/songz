import React from 'react';

interface SelectMessageProps {
  isAuthenticated: boolean;
}

const SelectMessage: React.FC<SelectMessageProps> = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-indigo-500 text-gray-800 p-4 mb-6 rounded-lg shadow-sm" role="alert">
        <h2 className="text-xl font-bold mb-2 text-indigo-700">Welcome to Beat Battle!</h2>
        <p className="font-medium">
          Ready for the ultimate song showdown? 🎵🏆
        </p>
        <p className="mt-2">
          Choose your favorite between two tracks and help us find your top songs!
        </p>
        <p className="font-bold text-purple-700 mt-2">
          Let the music battle begin! 🚀
        </p>
      </div>
    );
  }
  return null;
};

export default SelectMessage;