---
title: ReactとFlaskを連携させてみる part2
slug: integrating-react-flask-part-2
date: 2023-07-09
modified_time: 2023-07-09
description: React→Flask→Reactのデータフロー実装について。FlaskとReactの連携part2。
icon: ⚛️
icon_url: /icons/atom_symbol_flat.svg
tags:
  - Python
  - Flask
  - API
  - React
---
## 目的

前に書いた記事ではFlask→Reactは実施しても、React→Flask→Reactは実施できていなかったのでやってみる

記事はこちら↓

https://qiita.com/Suntory_N_Water/items/03ea848848cdc434181f


## 実際にやってみた

## フロー

Reactでエディットに値を入力し、ボタン押下でFlaskに値を渡します。
渡された値を計算し、Reactに計算結果を返すアプリにしてみます。

``` tsx
import { useState } from 'react';
import './App.css';
import axios from "axios";

interface Data {
  value: number;
}

function App() {
  const [value, setValue] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleSubmit = () => {
    const data: Data = {
      value: parseInt(value),
    };

    axios.post('api/data', data)
      .then((response) => {
        setResult(response.data.result);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={handleSubmit}>おす</button>
        {result && <p>けっか: {result}</p>}
      </header>
    </div>
  );
};

export default App;
```

Flaskでは受け取った値を2倍し、計算結果を返します。

``` python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['get'])
def get_data():
    return "Hello World"

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json()
    double_value = data['value'] * 2
    return jsonify({'result': double_value})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

## 実際に動かしてみる

しっかり反映されました。

![google-chrome-2023-07-09-10-09-38.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/c324a761-08a4-3315-0838-897a3e6420b8.gif)

