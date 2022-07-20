import React, { Component, Ref, useRef } from "react";
import { Fiber } from "react-reconciler";
import Parent from "./Parent";
import { addChild, ParentFiber, removeChild } from "./parentFiber";
import "./styles.css";

function getFiberFromClassInstance(instance: Component): Fiber {
  // @ts-ignore
  return instance["_reactInternals"];
}

const reparent = (fromParent: Ref<ParentFiber>, toParent: Ref<ParentFiber>) => {
  if (!fromParent) return;
  if (!toParent) return;

  if (typeof fromParent === "function") {
    return;
  }

  if (typeof toParent === "function") {
    return;
  }

  const fib = fromParent.current?.getFiber();
  const toFib = toParent.current?.getFiber();

  if (!fib) return;
  if (!toFib) return;
  const child = removeChild(fib, 0);
  if (!child) return;

  addChild(toFib, fib, 0);
};

const App = (): JSX.Element => {
  const parentRef = useRef<ParentFiber>(null);
  const parentRefTwo = useRef<ParentFiber>(null);

  return (
    <div>
      <div className="App">
        <div>
          <h1>Reparent Demo</h1>
        </div>
      </div>
      <div
        className="App"
        style={{
          background: "blue",
        }}
      >
        <Parent parentRef={parentRef}>
          <div>
            <h4>parent</h4>
          </div>
          <div>
            <input type="text" />
          </div>
        </Parent>
      </div>
      <div
        className="App"
        style={{
          borderBlockColor: "red",
          background: "red",
        }}
      >
        <h1>I am a middle man</h1>
      </div>
      <div
        className="App"
        style={{
          background: "yellow",
        }}
      >
        <Parent parentRef={parentRefTwo}>
          <div>
            <h4>add me sibling</h4>
          </div>
        </Parent>
      </div>
      <div className="App">
        <button onClick={() => reparent(parentRef, parentRefTwo)}>
          ReParnet
        </button>
      </div>
    </div>
  );
};

export default App;
