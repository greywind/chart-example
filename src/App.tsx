import React, { useCallback, useEffect, useState } from 'react';
import { Point } from 'src/types';
import './App.css';
import Chart from './chart';

function App() {
  const [countOfPoints, setCountOfPoints] = useState("1000000");
  const [data, setData] = useState<Point[]>([]);
  const [chartKey, setChartKey] = useState(0);

  const redrawChart = useCallback(() => {
    const size = +countOfPoints;
    if (!size)
      return;

    const newData: Point[] = [];
    let lastValue = 0;

    for (let x = 0; x < size; x++) {
      lastValue = lastValue + Math.floor(Math.random() * 21) - 10;
      newData.push({ x, y: lastValue });
    }
    setData(newData);
    setChartKey(key => key + 1);
  }, [countOfPoints]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { redrawChart(); }, []);

  return (
    <div className="App">
      <header className="App-header">
        Chart with a lot of points example
      </header>
      <div>
        <input type="number" value={countOfPoints} onChange={e => setCountOfPoints(e.target.value)} />
        <button onClick={redrawChart}>
          Redraw chart
        </button>
      </div>
      <Chart key={chartKey} data={data} />
    </div>
  );
}

export default App;
