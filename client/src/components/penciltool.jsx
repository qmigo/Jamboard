import React, { useLayoutEffect, useState, useRef } from 'react';
import rough from 'roughjs/bundled/rough.esm'

const gen = rough.generator()

const PencilTool = () => {
  const [curves, setCurves] = useState([]);
  const [drawing, setDrawing] = useState(false);


  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const rc = rough.canvas(canvas)
    
    curves.forEach((curve)=>{
      rc.linearPath(curve)
    })

  }, [curves]);

  const startDrawing = (event) => {
    setDrawing(true);
    const {clientX, clientY} = event
    const prevCurves = curves
    prevCurves.push([[clientX, clientY]])
    setCurves(prevCurves)
  };

  const finishDrawing = () => {
    setDrawing(false);
  };

  const draw = (event) => {
    if (!drawing) return;
    const {clientX, clientY} = event
    const index = curves.length-1
    const copyCurves = [...curves]
    copyCurves[index].push([clientX, clientY])
    setCurves(copyCurves)
  };
  console.log(curves)
  return (
    <canvas
      id='canvas'
      width={window.innerWidth}
      height={window.innerWidth}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
    >
      Canvas
    </canvas>
  );
};
export default PencilTool;