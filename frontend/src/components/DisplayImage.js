// DisplayImage.js

import React from 'react';

const DisplayImage = ({ imageGenerationOutput }) => {
  return (
    <div>
      <h1>Display Image Page</h1>
      <p>JSON Response:</p>
      <pre>{imageGenerationOutput}</pre>
    </div>
  );
};

export default DisplayImage;
