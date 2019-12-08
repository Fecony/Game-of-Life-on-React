import React, { useState, useRef, useEffect } from 'react';
import Cell from './Cell/Cell';
import produce from 'immer';

const cellSize = 20;

export default function App() {
  const [size, setWindowSize] = useState(() => getWindowSize());
  const [grid, setGrid] = useState(() => generateGrid(size));
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [running, setRunning] = useState(false);
  const [maxTotal, setMaxTotal] = useState(0);

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

  const startSimulation = () => {
    if (!runningRef.current) return;

    setGrid(gridValue => {
      return produce(gridValue, gridCopy => {
        for (let i = 0; i < size.rows; i++) {
          for (let o = 0; o < size.cols; o++) {
            const cell = grid[i][o];
            if (cell.total > maxTotal) {
              setMaxTotal(cell.total);
            }

            let neighbours = 0;

            for (let x = -1; x < 2; x++) {
              for (let y = -1; y < 2; y++) {
                if (x === 0 && y === 0) continue;

                const newI = i + x;
                const newO = o + y;

                if (
                  newI >= 0 &&
                  newI < size.rows &&
                  newO >= 0 &&
                  newO < size.cols
                ) {
                  neighbours += gridValue[newI][newO].isAlive;
                }
              }
            }

            // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            // Any live cell with more than three live neighbours dies, as if by overpopulation.
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[i][o].isAlive = 0;

              // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            } else if (gridValue[i][o].isAlive === 0 && neighbours === 3) {
              gridCopy[i][o].isAlive = 1;
            }
          }
        }
      });
    });

    requestAnimationFrame(startSimulation);
  };

  const handleMouseDown = (row, col) => {
    const newGrid = drawShape(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    const newGrid = drawShape(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  return (
    <>
      <div className='buttons'>
        <button
          className='button'
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              requestAnimationFrame(startSimulation);
            }
          }}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button
          className='button'
          onClick={() => {
            setGrid(generateGrid(size, true));
          }}
        >
          Randomize
        </button>
        <button
          className='button'
          onClick={() => {
            setRunning(false);
            setGrid(generateGrid(size));
          }}
        >
          Clear
        </button>
      </div>
      <div className='grid'>
        {grid.map((row, rowIdx) => {
          return (
            <div className='row' key={rowIdx}>
              {row.map((cell, cellIdx) => {
                const { row, col, isAlive } = cell;

                return (
                  <Cell
                    key={cellIdx}
                    col={col}
                    row={row}
                    isAlive={isAlive}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                    onMouseUp={() => handleMouseUp()}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

const generateGrid = (size, random = false) => {
  let newGrid = [];
  for (let row = 0; row < size.rows; row++) {
    const currentRow = [];
    for (let col = 0; col < size.cols; col++) {
      currentRow.push(createCell(row, col, random));
    }
    newGrid.push(currentRow);
  }
  return newGrid;
};

const createCell = (row, col, random) => {
  return {
    row,
    col,
    isAlive: random ? Math.floor(Math.random() * 2) : 0
  };
};

const getWindowSize = () => {
  return {
    cols: Math.floor(window.innerWidth / cellSize),
    rows: Math.floor(window.innerHeight / cellSize) - 2
  };
};

const drawShape = (grid, row, col) => {
  const newGrid = grid.slice();
  const cell = grid[row][col];

  const newCell = {
    ...cell,
    isAlive: cell.isAlive ? 0 : 1
  };

  newGrid[row][col] = newCell;

  return newGrid;
};
