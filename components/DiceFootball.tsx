'use client';

import React, { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

type GestureState = {
  startY: number;
  startTime: number;
  isDragging: boolean;
};

type RollResult = {
  velocity: number;
  distance: number;
  landingZone: 'short' | 'field' | 'endzone' | 'touchdown' | 'off';
};

type DicePosition = {
  value: number;
  startX: number;
  startY: number;
  finalX: number;
  finalY: number;
  isRolling: boolean;
  landingZone: RollResult['landingZone'];
  velocity: number;
};

type Scores = {
  player1: number;
  player2: number;
};

const DiceFootball = () => {
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState<Scores>({ player1: 0, player2: 0 });
  const [rolling, setRolling] = useState(false);
  const [remainingDice, setRemainingDice] = useState(2);
  const [dicePositions, setDicePositions] = useState<DicePosition[]>([]);
  const [lastRollResult, setLastRollResult] = useState('');
  const [gestureState, setGestureState] = useState<GestureState>({
    startY: 0,
    startTime: 0,
    isDragging: false
  });

  const getDiceIcon = (value: number) => {
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

  const calculateRollResult = (velocity: number): RollResult => {
    const normalizedVelocity = Math.min(Math.abs(velocity), 3) / 3;
    
    let landingZone: RollResult['landingZone'];
    let distance: number;
    
    if (normalizedVelocity < 0.3) {
      landingZone = 'short';
      distance = normalizedVelocity * 150 + Math.random() * 50;
    } else if (normalizedVelocity > 0.8) {
      landingZone = 'off';
      distance = 450;
    } else if (normalizedVelocity > 0.6 && normalizedVelocity < 0.8) {
      if (Math.random() < 0.15) {
        landingZone = 'touchdown';
        distance = 330;
      } else {
        landingZone = 'endzone';
        distance = 300 + Math.random() * 40;
      }
    } else {
      landingZone = 'field';
      distance = normalizedVelocity * 200 + Math.random() * 100;
    }

    return {
      velocity: normalizedVelocity,
      distance,
      landingZone
    };
  };

  const handleGestureStart = (clientY: number) => {
    if (!rolling && remainingDice > 0) {
      setGestureState({
        startY: clientY,
        startTime: Date.now(),
        isDragging: true
      });
    }
  };

  const handleGestureEnd = (clientY: number) => {
    if (!gestureState.isDragging || rolling || remainingDice === 0) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - gestureState.startTime;
    const distance = gestureState.startY - clientY;
    
    // Calculate velocity and adjust for player direction
    let velocity = distance / duration;
    if (currentPlayer === 2) {
      velocity = -velocity; // Invert for bottom player
    }
    
    setGestureState({
      startY: 0,
      startTime: 0,
      isDragging: false
    });

    rollDiceWithPower(velocity);
  };

  const rollDiceWithPower = (velocity: number) => {
    const rollResult = calculateRollResult(velocity);
    const newDice = Math.floor(Math.random() * 6) + 1;
    const isTopPlayer = currentPlayer === 1;
    
    const startX = Math.random() * 100 - 50;
    const startY = isTopPlayer ? 30 : 350;
    const finalX = startX + (Math.random() * 200 - 100);
    const finalY = isTopPlayer ? rollResult.distance : (380 - rollResult.distance);

    setRolling(true);
    
    const newPosition = {
      value: newDice,
      startX,
      startY,
      finalX,
      finalY,
      isRolling: true,
      landingZone: rollResult.landingZone,
      velocity: rollResult.velocity
    };

    setDicePositions(prev => [...prev, newPosition]);
    
    setTimeout(() => {
      setRolling(false);
      setRemainingDice(prev => prev - 1);
      
      if (rollResult.landingZone === 'touchdown') {
        setScores(prev => {
          const playerKey = `player${currentPlayer}` as keyof Scores;
          return {
            ...prev,
            [playerKey]: prev[playerKey] + 7
          };
        });
        setLastRollResult('TOUCHDOWN! +7 points');
      } else if (rollResult.landingZone === 'endzone') {
        setScores(prev => {
          const playerKey = `player${currentPlayer}` as keyof Scores;
          return {
            ...prev,
            [playerKey]: prev[playerKey] + newDice
          };
        });
        setLastRollResult(`In the endzone! +${newDice} points`);
      } else if (rollResult.landingZone === 'off') {
        setLastRollResult('Off the table!');
      } else if (rollResult.landingZone === 'short') {
        setLastRollResult('Roll harder!');
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

      <div 
        className="relative bg-green-600 rounded-xl p-8 mb-8 h-96 overflow-hidden"
        onTouchStart={(e) => handleGestureStart(e.touches[0].clientY)}
        onTouchEnd={(e) => handleGestureEnd(e.changedTouches[0].clientY)}
        onMouseDown={(e) => handleGestureStart(e.clientY)}
        onMouseUp={(e) => handleGestureEnd(e.clientY)}
        onMouseLeave={(e) => gestureState.isDragging && handleGestureEnd(e.clientY)}
      >
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
              className={`absolute bg-white p-2 rounded-lg shadow-lg dice ${gestureState.isDragging ? 'dragging' : ''}`}
              style={{
                left: '50%',
                top: 0,
                '--start-x': `${dice.startX}px`,
                '--start-y': `${dice.startY}px`,
                '--end-x': `${dice.finalX}px`,
                '--end-y': `${dice.finalY}px`,
                '--velocity': dice.velocity,
                transform: `translate(-50%, 0) translate(${dice.startX}px, ${dice.startY}px)`,
                animation: `${dice.landingZone === 'off' ? 'rollOff' : 'rollAcross'} ${2 / dice.velocity}s forwards`
              }}
            >
              {getDiceIcon(dice.value)}
            </div>
          ))}
          
          {!rolling && remainingDice > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-white text-opacity-50 text-lg">
                {currentPlayer === 1 ? "↓ Flick down to roll ↓" : "↑ Flick up to roll ↑"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceFootball;
