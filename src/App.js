import "./App.css";
import React, { useState } from "react";
import useMouse from "@react-hook/mouse-position";

const toolsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map(
  (name, i) => ({
    name,
    i,
  })
);

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

function Tool({ active, data, handleDown, handleUp, removeThisTool }) {
  const ref = React.useRef();
  const mouse = useMouse(ref);

  return (
    <div
      ref={ref}
      key={data.i}
      className={`tool ${active === null ? "" : "dragging"}`}
      onMouseUp={() => handleUp(data)}
    >
      {data.name}
      <div
        className="move-button"
        onMouseDown={() => handleDown(data, { x: mouse.x, y: mouse.y })}
      >
        Move
      </div>
      <div
        className="remove-button"
        onClick={(e) => {
          e.stopPropagation();
          removeThisTool();
        }}
      >
        -
      </div>
    </div>
  );
}

function AddTool({ data, enableThisTool }) {
  return (
    <div key={data.i} className="tool add-tool" onClick={enableThisTool}>
      {data.name}
    </div>
  );
}

function AddButton({ enabledTools, setEnabled, setPositions }) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const enableTool = (tool) => {
    console.log('en', tool);
    // Put the just-enabled tool last
    setPositions((prev) => {
      const newPositions = prev.filter(pos => pos !== tool.i);
      newPositions.push(tool.i);
      return newPositions;
    });

    setEnabled((prev) => {
      return prev.map((enabled, i) => (i === tool.i ? true : enabled));
    });
  };

  return (
    <>
      <div key="add" className={`tool`} onClick={() => setMenuOpen(true)}>
        Add
      </div>
      {isMenuOpen && (
        <div className="add-tools">
          {toolsList
            .filter((tool) => !enabledTools[tool.i])
            .map((tool) => (
              <AddTool data={tool} enableThisTool={() => enableTool(tool)} />
            ))}
        </div>
      )}
    </>
  );
}

function App() {
  // 1, 0, 2, 3, 4, 5, 6, 7 means B, A, ....
  // So if pos[i] = j that means tool j is at position i.

  const [positions, setPositions] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [active, setActive] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(toolsList.map((_, i) => i % 2 === 0));

  const ref = React.useRef(null);
  const mouse = useMouse(ref, { enterDelay: 100, leaveDelay: 100 });

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
    if (active === null) {
      return;
    }

    setPositions((positions) => {
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

  const removeTool = (tool) => {
    console.log("remove");
    setEnabled((prev) => {
      return prev.map((enabled, i) => (i === tool.i ? false : enabled));
    });
  };

  const list = positions
    .map((position) => toolsList.find((tool) => tool.i === position))
    .filter((tool) => enabled[tool.i])
    .map((data) => (
      <Tool
        active={active}
        data={data}
        handleDown={handleDown}
        handleUp={handleUp}
        removeThisTool={() => removeTool(data)}
      />
    ));

  list.push(<AddButton setPositions={setPositions} enabledTools={enabled} setEnabled={setEnabled} />);

  const first = list.slice(0, 5);
  const second = list.slice(5);

  return (
    <div className="container" ref={ref}>
      {active !== null && (
        <FloatingTool mouse={mouse} active={active} offset={offset} />
      )}
      <div className="toolbar">{first}</div>
      <div className="toolbar">{second}</div>
    </div>
  );
}

export default App;
