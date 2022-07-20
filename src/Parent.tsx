import { Component, ReactNode, Ref } from "react";
import { Fiber } from "react-reconciler";
import { ParentFiber } from "./parentFiber";

export interface ParentProps {
  children: ReactNode;
  parentRef: Ref<ParentFiber>;
}

function getFiberFromClassInstance(instance: Component): Fiber {
  // @ts-ignore
  return instance["_reactInternals"];
}

export default class Parent extends Component<ParentProps> {
  parent: ParentFiber = new ParentFiber();
  componentDidMount(): void {
    const { parentRef } = this.props;
    if (!parentRef) return;
    const fiber = getFiberFromClassInstance(this);
    this.parent.setFiber(fiber);
    if (typeof parentRef === "function") return;
    // @ts-ignore
    else if (parentRef) parentRef.current = this.parent;
  }
  render(): ReactNode {
    const { children } = this.props;

    return children;
  }
}
