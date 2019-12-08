import React from 'react';
import './Cell.css';

const Cell = props => {
  const { col, row, isAlive, onMouseDown, onMouseEnter, onMouseUp } = props;

  const extraClass = isAlive ? 'alive' : '';

  return (
    <div
      className={`cell ${extraClass}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></div>
  );
};

export default Cell;
