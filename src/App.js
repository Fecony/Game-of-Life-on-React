import React, { useState, useCallback, useRef, useEffect } from 'react';
import produce from 'immer';

const cellSize = 20;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const generateGrid = size => {
  return Array(size.rows)
    .fill(null)
    .map(() => Array(size.cols).fill(0));
};

const generateRandomGrid = size => {
  return Array(size.rows)
    .fill(null)
    .map(() =>
      Array(size.cols)
        .fill(null)
        .map(() => Math.floor(Math.random() * 2))
    );
};

const getWindowSize = () => {
  return {
    cols: Math.floor(window.innerWidth / cellSize),
    rows: Math.floor(window.innerHeight / cellSize) - 2
  };
};

const App = () => {
  const [size, setWindowSize] = useState(() => getWindowSize());
  const [grid, setGrid] = useState(() => generateGrid(size));
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
      setGrid(generateGrid(size));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid(gridValue => {
      return produce(gridValue, gridCopy => {
        for (let i = 0; i < size.rows; i++) {
          for (let o = 0; o < size.cols; o++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newO = o + y;
              if (
                newI >= 0 &&
                newI < size.rows &&
                newO >= 0 &&
                newO < size.cols
              ) {
                neighbors += gridValue[newI][newO];
              }
            });

            // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            // Any live cell with more than three live neighbours dies, as if by overpopulation.
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][o] = 0;
              // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            } else if (gridValue[i][o] === 0 && neighbors === 3) {
              gridCopy[i][o] = 1;
            }
          }
        }
      });
    });

    requestAnimationFrame(runSimulation);
  }, [size.cols, size.rows]);

  return (
    <>
      <div className='buttons'>
        <button
          className='button'
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              requestAnimationFrame(runSimulation);
            }
          }}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button
          className='button'
          onClick={() => {
            setGrid(generateRandomGrid(size));
          }}
        >
          Randomize
        </button>
        <button
          className='button'
          onClick={() => {
            setGrid(generateGrid(size));
          }}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size.rows}, ${cellSize}px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, o) => (
            <div
              key={`${i}-${o}`}
              className='entity'
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][o] = grid[i][o] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: grid[i][o] ? '#09d3ac' : undefined
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default App;
