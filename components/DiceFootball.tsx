'use client';

import React, { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceFootball = () => {
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [rolling, setRolling] = useState(false);
  const [remainingDice, setRemainingDice] = useState(2);
  const [dicePositions, setDicePositions] = useState([]);
  const [lastRollResult, setLastRollResult] = useState('');

  const getDiceIcon = (value) => {
    const props = { size: 32, className: "text-slate-700" };
    switch(value) {
      case 1: return <Dice1 {...props} />;
      case 2: return <Dice2 {...props} />;
      case 3: return <Dice3 {...props} />;
      case 4: return <Dice4 {...props} />;
      case 5: return <Dice5 {...props} />;
      case 6: return <Dice6 {...props} />;
      default: return null;
    }
  };

  const rollDice = () => {
    if (rolling || remainingDice === 0) return;
    
    setRolling(true);
    const newDice = Math.floor(Math.random() * 6) + 1;
    const isTopPlayer = currentPlayer === 1;
    
    const rollPower = Math.random();
    const startX = Math.random() * 100 - 50;
    const startY = isTopPlayer ? 30 : 350;
    
    let finalY, landingZone;
    if (rollPower > 0.8) {
      finalY = isTopPlayer ? 450 : -50; // Off table
      landingZone = 'off';
    } else if (rollPower > 0.5) {
      finalY = isTopPlayer ? 
        (Math.random() * 160 + 180) : // Bottom half of field
        (Math.random() * 160 + 40);   // Top half of field
      landingZone = 'field';
    } else {
      if (Math.random() < 0.2) {
        finalY = isTopPlayer ? 330 : 50; // Touchdown
        landingZone = 'touchdown';
      } else {
        finalY = isTopPlayer ?
          (Math.random() * 40 + 300) : // Bottom endzone
          (Math.random() * 40 + 20);   // Top endzone
        landingZone = 'endzone';
      }
    }

    const finalX = startX + (Math.random() * 200 - 100);

    const newPosition = {
      value: newDice,
      startX,
      startY,
      finalX,
      finalY,
      isRolling: true,
      landingZone
    };

    setDicePositions(prev => [...prev, newPosition]);
    
    setTimeout(() => {
      setRolling(false);
      setRemainingDice(prev => prev - 1);
      
      if (landingZone === 'touchdown') {
        setScores(prev => ({
          ...prev,
          [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + 7
        }));
        setLastRollResult('TOUCHDOWN! +7 points');
      } else if (landingZone === 'endzone') {
        setScores(prev => ({
          ...prev,
          [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + newDice
        }));
        setLastRollResult(`In the endzone! +${newDice} points`);
      } else if (landingZone === 'off') {
        setLastRollResult('Off the table!');
      } else {
        setLastRollResult('On the field');
      }
      
      if (remainingDice === 1) {
        setTimeout(() => {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setRemainingDice(2);
          setDicePositions([]);
          setLastRollResult('');
        }, 2000);
      }
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gradient-to-b from-green-100 to-green-200 rounded-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-4">Dice Football</h1>
        <div className="flex justify-around mb-4">
          <div className={`p-4 rounded-lg ${currentPlayer === 1 ? 'bg-green-500 text-white' : 'bg-green-200'}`}>
            <p className="font-bold">Player 1</p>
            <p className="text-2xl">{scores.player1}</p>
          </div>
          <div className={`p-4 rounded-lg ${currentPlayer === 2 ? 'bg-green-500 text-white' : 'bg-green-200'}`}>
            <p className="font-bold">Player 2</p>
            <p className="text-2xl">{scores.player2}</p>
          </div>
        </div>
        {lastRollResult && (
          <div className="text-lg font-bold text-green-700 mt-2">
            {lastRollResult}
          </div>
        )}
      </div>

      <div className="relative bg-green-600 rounded-xl p-8 mb-8 h-96 overflow-hidden">
        <div className="absolute top-2 left-2 right-2 h-20 border-2 border-white rounded opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white transform rotate-45" />
        </div>
        
        <div className="absolute top-1/2 left-2 right-2 h-px bg-white opacity-50" />
        
        <div className="absolute bottom-2 left-2 right-2 h-20 border-2 border-white rounded opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white transform rotate-45" />
        </div>
        
        <div className="relative w-full h-full perspective-1000">
          {dicePositions.map((dice, index) => (
            <div
              key={index}
              className="absolute bg-white p-2 rounded-lg shadow-lg dice"
              style={{
                left: '50%',
                top: 0,
                '--start-x': `${dice.startX}px`,
                '--start-y': `${dice.startY}px`,
                '--end-x': `${dice.finalX}px`,
                '--end-y': `${dice.finalY}px`,
                transform: `translate(-50%, 0) translate(${dice.startX}px, ${dice.startY}px)`,
                animation: `${dice.landingZone === 'off' ? 'rollOff' : 'rollAcross'} 2s forwards`
              }}
            >
              {getDiceIcon(dice.value)}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={rollDice}
          disabled={rolling || remainingDice === 0}
          className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg
            ${rolling || remainingDice === 0 
              ? 'bg-gray-400' 
              : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
        >
          {rolling ? 'Rolling...' : `Roll Dice (${remainingDice} left)`}
        </button>
      </div>
    </div>
  );
};

export default DiceFootball;