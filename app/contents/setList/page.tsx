import React from 'react';
import lives from '../../../data/liveName.json';

const SetList = () => {
  return (
    <div>
      <h1>ライブ一覧</h1>
      <ul>
        {lives.map((live) => (
          <li key={live.id}>{live.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SetList;
