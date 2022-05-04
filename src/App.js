import "./App.css";
import React, { useState } from "react";
import useMouse from "@react-hook/mouse-position";

const toolsList = ["A", "B", "C", "D", "E", "F", "G", "H"].map((name, i) => ({
  name,
  i,
}));

// what if we could also drag below the bottom one?

// alternative: shrink the list first, then add back later

function FloatingTool({ mouse, active, offset }) {
  console.log(offset);

  return (
    <div
      key={active.i}
      className={`tool floating`}
      style={{
        transform: `translateX(${mouse.x - offset.x}px) translateY(${
          mouse.y - offset.y
        }px)`,
      }}
    >
      {active.name}
    </div>
  );
}

function Tool({ active, data, handleDown, handleUp }) {
  const ref = React.useRef();
  const mouse = useMouse(ref);

  return (
    <div
      ref={ref}
      key={data.i}
      className={`tool ${active === null ? "" : "dragging"}`}
      onMouseDown={() => handleDown(data, { x: mouse.x, y: mouse.y })}
      onMouseUp={() => handleUp(data)}
    >
      {data.name}
    </div>
  );
}

function App() {
  // 1, 0, 2, 3, 4, 5, 6, 7 means B, A, ....
  // So if pos[i] = j that means element j is at position i.

  const [positions, setPositions] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [active, setActive] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const ref = React.useRef(null);
  const mouse = useMouse(ref, { enterDelay: 100, leaveDelay: 100 });

  const list = positions.map((position) =>
    toolsList.find((tool) => tool.i === position)
  );

  const handleDown = (tool, clickOffset) => {
    console.log(
      `down ${JSON.stringify(tool)}, active = ${JSON.stringify(
        active
      )}, offset = ${JSON.stringify(clickOffset)}`
    );
    if (active === null) {
      setActive(tool);
      setOffset(clickOffset);
      setPositions((positions) => {
        return positions.filter((position) => position !== tool.i);
      });
    }
  };

  const handleUp = (tool) => {
    setPositions((positions) => {
      console.log(positions, active.i);
      const newPositions = positions.slice(0);
      newPositions.splice(
        positions.findIndex((pos) => pos === tool.i),
        0,
        active.i
      );
      console.log("bef aft", positions, newPositions);
      return newPositions;
    });
    setActive(null);
  };

  const first = list.slice(0, 5);
  const second = list.slice(5);

  return (
    <div className="container" ref={ref}>
      {active !== null && (
        <FloatingTool mouse={mouse} active={active} offset={offset} />
      )}
      <div className="toolbar">
        {first.map((data) => (
          <Tool active={active} data={data} handleDown={handleDown} handleUp={handleUp} />
        ))}
      </div>
      <div className="toolbar">
        {second.map((data) => (
          <Tool active={active} data={data} handleDown={handleDown} handleUp={handleUp} />
        ))}
      </div>
    </div>
  );
}

export default App;
