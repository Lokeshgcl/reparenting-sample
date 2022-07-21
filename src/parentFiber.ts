import { Fiber } from "react-reconciler";
import { Env } from "./env";

export class ParentFiber {
  /** The parent fiber. */
  fiber: Fiber | null = null;

  setFiber(fiber: Fiber): void {
    this.fiber = fiber;
  }

  getFiber(): Fiber | null {
    return this.fiber;
  }
}

export function removeChild(
  parent: Fiber,
  childSelector: string | number,
  skipUpdate?: boolean
): Fiber | null {
  // The removed child.
  let child = null;

  // Remove the child.
  if (typeof childSelector === "number") {
    child = removeChildFiberAt(parent, childSelector);
  }

  // If the child is not found return null.
  if (child === null) {
    return null;
  }

  // If there are siblings their indices need to be updated.
  if (child.sibling !== null) {
    updateFibersIndex(child.sibling, child.index);
  }

  // If There is no alternate we can return here.
  if (child.alternate !== null && parent.alternate !== null) {
    // The alternate child.
    let alternate = null;

    // Remove the alternate child.
    if (typeof childSelector === "number") {
      alternate = removeChildFiberAt(parent.alternate, childSelector);
    }

    // If there are siblings their indices need to be updated.
    if (alternate && alternate.sibling !== null) {
      updateFibersIndex(alternate.sibling, alternate?.index);
    }
  }

  // If we don't have to send the elements we can return here.
  if (skipUpdate) {
    return child;
  }

  // Get the fibers that belong to the container elements.
  const containerFiber = getFiberFromPath(
    parent,
    (fiber) => fiber.return,
    (fiber) => Env.isElement(fiber.elementType, fiber.stateNode)
  );

  // Get the fibers that belong to the child element.
  const elementFiber = getFiberFromPath(
    child,
    (fiber) => fiber.child,
    (fiber) => Env.isElement(fiber.elementType, fiber.stateNode)
  );

  // Container element not found.
  if (containerFiber === null) {
    return child;
  }

  // Child element not found.
  if (elementFiber === null) {
    return child;
  }

  // Get the elements instances.
  const container = containerFiber.stateNode;
  const element = elementFiber.stateNode;

  // Remove the element instance.
  Env.removeChildFromContainer(container, element);

  return child;
}

export function removeChildFiberAt(parent: Fiber, index: number): Fiber | null {
  // Remove the first child fiber.
  if (index === 0) {
    return removeFirstChildFiber(parent);
  }
  return null;
}

export function removeFirstChildFiber(parent: Fiber): Fiber | null {
  const removed = parent.child;

  // If the parent has no children return null.
  if (removed === null) {
    return null;
  }

  // Update fiber references.
  parent.child = removed.sibling;

  return removed;
}

export function updateFibersIndex(fiber: Fiber, index: number): number {
  while (fiber) {
    fiber.index = index;
    (fiber as Fiber | null) = fiber.sibling;
    index += 1;
  }

  return index - 1;
}

export function getFiberFromPath(
  fiber: Fiber | null,
  next: (current: Fiber) => Fiber | null,
  stop: (current: Fiber) => boolean
): Fiber | null {
  while (fiber) {
    if (stop(fiber)) {
      return fiber;
    }

    // Search in the next instance.
    fiber = next(fiber);
  }

  return null;
}

export function addChild(
  parent: Fiber,
  child: Fiber,
  position: string | number,
  skipUpdate?: boolean
): number {
  // The index in which the child is added.
  let index: number = 0;

  // Add the child.
  if (typeof position === "number") {
    index = addChildFiberAt(parent, child, position);
  }

  // Update the child fields.
  updateFibersIndex(child, index);

  // If there are the alternates.
  if (child.alternate === null || parent.alternate === null) {
    if (child.alternate !== null) {
      child.alternate.return = null;
      child.alternate.sibling = null;
    }
  } else {
    // Add the alternate child.
    if (typeof position === "number") {
      addChildFiberAt(parent.alternate, child.alternate, position);
    }

    // Update the alternate child fields.
    updateFibersIndex(child.alternate, index);
  }

  // If we don't have to send the elements we can return here.
  if (skipUpdate) {
    return index;
  }

  // Get the fibers that belong to the container elements.
  const containerFiber = getFiberFromPath(
    parent,
    (fiber) => fiber.return,
    (fiber) => Env.isElement(fiber.elementType, fiber.stateNode)
  );

  // Get the fibers that belong to the child element.
  const elementFiber = getFiberFromPath(
    child,
    (fiber) => fiber.child,
    (fiber) => Env.isElement(fiber.elementType, fiber.stateNode)
  );

  // Container element not found.
  if (containerFiber === null) {
    return index;
  }

  // Child element not found.
  if (elementFiber === null) {
    return index;
  }

  // Get the elements instances.
  const container = containerFiber.stateNode;
  const element = elementFiber.stateNode;

  // Add the child element.
  if (child.sibling === null) {
    // Append the child to the container.
    Env.appendChildToContainer(container, element);
  } else {
    // Get the fibers that belong to the previous element.
    const beforeFiber = getFiberFromPath(
      child.sibling,
      (fiber) => fiber.child,
      (fiber) => Env.isElement(fiber.elementType, fiber.stateNode)
    );

    if (beforeFiber !== null) {
      const before = beforeFiber.stateNode;
      // Insert the child element in the container.
      Env.insertInContainerBefore(container, element, before);
    }
  }

  return index;
}

export function addChildFiberAt(
  parent: Fiber,
  child: Fiber,
  index: number
): number {
  // Add the fiber at the bottom.
  if (index === -1) return appendChildFiber(parent, child);
  // Add the fiber at the beginning.
  if (index === 0) return prependChildFiber(parent, child);

  // Find the previous sibling.
  // At this point we are sure that the index is greater than 0.
  const previousSibling = findChildFiberAt(parent, index - 1);

  // If there are no children, the fiber is added as the only child.
  if (previousSibling === null) {
    return prependChildFiber(parent, child);
  }

  // Add the fiber as sibling of the previous one.
  return addSiblingFiber(previousSibling, child);
}

export function appendChildFiber(parent: Fiber, child: Fiber): number {
  const previousFiber = findChildFiberAt(parent, -1);

  // If the parent fiber has no children.
  if (previousFiber === null) {
    return prependChildFiber(parent, child);
  }

  return addSiblingFiber(previousFiber, child);
}

export function addSiblingFiber(fiber: Fiber, sibling: Fiber): number {
  const oldSibling = fiber.sibling;
  const index = fiber.index + 1;

  // Update the sibling fiber fields.
  fiber.sibling = sibling;
  sibling.return = fiber.return;
  sibling.sibling = oldSibling;

  return index;
}
export function prependChildFiber(parent: Fiber, child: Fiber): number {
  const oldFirstChild = parent.child;

  // Update the child fiber fields.
  parent.child = child;
  child.sibling = oldFirstChild;
  child.return = parent;

  return 0;
}

export function findChildFiberAt(parent: Fiber, index: number): Fiber | null {
  // The first child.
  let { child } = parent;

  // If the parent has no children.
  if (child === null) {
    return null;
  }

  if (index === -1) {
    // Find the last child.
    while (child.sibling) {
      child = child.sibling;
    }
  } else {
    // Find the child at the given index.
    while (child.sibling && index > 0) {
      index -= 1;
      child = child.sibling;
    }
  }

  return child;
}
