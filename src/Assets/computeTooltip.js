import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";

export default function computeTooltip(event, tooltipRef, arrowRef) {
  computePosition(event.target, tooltipRef, {
    placement: "top",
    middleware: [offset(10), shift(), arrow({ padding: 5, element: arrowRef })],
  }).then(({ x, y, middlewareData, placement }) => {
    Object.assign(tooltipRef.style, {
      left: `${x}px`,
      top: `${y}px`,
      visibility: "visible",
    });

    const side = placement.split("-")[0];

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[side];

    if (middlewareData.arrow) {
      const { x, y } = middlewareData.arrow;
      Object.assign(arrowRef.style, {
        left: x != null ? `${x}px` : "",
        top: y != null ? `${y}px` : "",
        [staticSide]: `${-arrowRef.offsetWidth / 2}px`,
        transform: "rotate(45deg)",
        visibility: "visible",
      });
    }
  });
}
