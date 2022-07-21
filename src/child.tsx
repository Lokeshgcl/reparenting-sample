import { ChangeEvent, ChangeEventHandler, useState } from "react";

const Child = () => {
  const [textVal, setTextVal] = useState("");
  const onchange = (event: ChangeEvent<HTMLInputElement>) => {
    setTextVal(event.target.value);
  };
  const clickHandler = () => {
    const ele = document.getElementById("childLabel");
    if (!ele) return null;
    ele.textContent = textVal;
  };
  return (
    <div>
      <div>
        <label id="childLabel"></label>
      </div>
      meove me : <input type="text" onChange={onchange} id="childText" />
      <button onClick={() => clickHandler()}>click me</button>
    </div>
  );
};

export default Child;
