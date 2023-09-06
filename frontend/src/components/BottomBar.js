import React from 'react';

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
  },
  textfield: {
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    backgroundColor: '#f0f0f0',
  },
};

function BottomBar({ onPageChange }) {
  return (
    <div style={styles.container}>
      <input type="text" style={styles.textfield} placeholder="Enter text..." />
      <div style={styles.buttons}>
        <button onClick={() => onPageChange('PageOne')}>Page 1</button>
        <button onClick={() => onPageChange('Home')}>Page 2</button>
        <button onClick={() => onPageChange('Button 3')}>Button 3</button>
        <button onClick={() => onPageChange('Button 4')}>Button 4</button>
        <button onClick={() => onPageChange('Button 5')}>Button 5</button>
      </div>
    </div>
  );
}

export default BottomBar;
