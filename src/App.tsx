import ParentOne from "./parentOne";
import React, { Component, Ref, useRef } from "react";
import { Fiber } from "react-reconciler";
import "./styles.css";
import ParentTwo from "./parentTwo";
import Parent from "./Parent";
import { addChild, ParentFiber, removeChild } from "./parentFiber";

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
      <div className="App" id="idApp">
        <ParentOne />
      </div>
      <div
        className="App"
        style={{
          background: "blue",
        }}
        id="idApp3"
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
        id="idApp4"
      >
        <Parent parentRef={parentRefTwo}>
          <div>
            <h4>add me sibling</h4>
          </div>
        </Parent>
      </div>
      <button onClick={() => reparent(parentRef, parentRefTwo)}>
        ReParnet
      </button>
    </div>
  );
};

export default App;
