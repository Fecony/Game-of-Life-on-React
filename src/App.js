import React, { useState, useCallback, useRef, useEffect } from 'react';
import produce from 'immer';

const cellSize = 30;
const operations = [
  [0, 1],
  [0, -1],
  [1, 0],
  [1, 1],
  [1, -1],
  [-1, 0],
  [-1, 1],
  [-1, -1]
];

const generateGrid = size => {
  return new Array(size.w).fill(null).map(() => new Array(size.h).fill(0));
};

const generateRandomGrid = size => {
  const rows = [];
  for (let i = 0; i < size.w; i++) {
    rows.push(Array.from(Array(size.h), () => (Math.random() > 0.8 ? 1 : 0)));
  }
  return rows;
};

const getWindowSize = () => {
  return {
    w: Math.floor(window.innerWidth / cellSize),
    h: Math.floor(window.innerHeight / cellSize) - 3
  };
};

const App = () => {
  const [windowSize, setWindowSize] = useState(() => getWindowSize());
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState(() => generateGrid(windowSize));

  const runRef = useRef(running);
  runRef.current = running;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
      console.log(generateGrid(windowSize));
      setGrid(generateGrid(windowSize));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowSize]);

  const startSimulation = useCallback(() => {
    if (!runRef.current) return;

    setGrid(gridValue => {
      return produce(gridValue, gridCopy => {
        for (let i = 0; i < grid.length; i++) {
          for (let o = 0; o < grid[i].length; o++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newO = o + y;

              if (
                newI >= 0 &&
                newI < windowSize.w &&
                newO >= 0 &&
                newO < windowSize.h
              ) {
                neighbors += gridValue[newI][newO];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][o] = 0;
            } else if (gridValue[i][o] === 0 && neighbors === 3) {
              gridCopy[i][o] = 1;
            }
          }
        }
      });
    });

    setTimeout(startSimulation, 100);
  }, [grid, windowSize.h, windowSize.w]);

  return (
    <>
      <div className='buttons'>
        <button
          className='button'
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runRef.current = true;
              startSimulation();
            }
          }}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button
          className='button'
          onClick={() => setGrid(generateRandomGrid(windowSize))}
        >
          Random
        </button>
        <button
          className='button'
          onClick={() => {
            setGrid(generateGrid(windowSize));
          }}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${windowSize.w}, ${cellSize}px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((cols, o) => (
            <div
              className='entity'
              key={`grid[${i}][${o}]`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][o] = gridCopy[i][o] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: grid[i][o] ? '#2dc7b2' : undefined,
                border: '1px solid rgba(255,255,255,0.01)'
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default App;
