export interface ENV<Instance> {
  appendChildToContainer(container: Instance, child: Instance): void;
  insertInContainerBefore(
    container: Instance,
    child: Instance,
    before: Instance
  ): void;

  removeChildFromContainer(container: Instance, child: Instance): void;
  isElement(type: any, stateNode?: Instance | any): boolean;
}

export const Env: ENV<any> = {
  appendChildToContainer(container, child) {
    container.appendChild(child);
  },
  insertInContainerBefore(container, child, before) {
    container.insertBefore(child, before);
  },
  removeChildFromContainer(container, child) {
    container.removeChild(child);
  },
  isElement(_, stateNode) {
    return stateNode instanceof Element;
  },
};
