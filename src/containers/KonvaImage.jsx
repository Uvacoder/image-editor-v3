import { forwardRef, useEffect, useRef } from "react";

import PropTypes from "prop-types";
import { Image } from "react-konva";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
/* eslint-disable max-len */
const KonvaImage = forwardRef(
  (
    {
      top,
      left,
      image,
      rotation,
      // originTop = 0, originLeft = 0, // relative to the image top/left
      onDragEnd,
      onMouseEnter,
      onMouseLeave,
      container,
      imageWidth,
      imageHeight
    },
    ref
  ) => {
    const originLeftRef = useRef(left);
    const originTopRef = useRef(top);

    useEffect(() => {
      originLeftRef.current = container.width / 2;
      originTopRef.current = container.height / 2;
    }, [rotation]);

    return (
      <Image
        ref={ref}
        image={image}
        offsetX={originLeftRef.current}
        offsetY={originTopRef.current}
        // with offset, the image is translated at { -container.width/2, -container.height/2 } in the parent stage
        // so need to re-translate it to { container.width/2, container.height/2 }
        // see: https://konvajs.org/docs/posts/Position_vs_Offset.html
        x={originLeftRef.current}
        y={originTopRef.current}
        draggable
        onDragEnd={onDragEnd}
        width={imageWidth}
        height={imageHeight}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        alt="user"
        rotation={rotation}
      />
    );
  }
);

KonvaImage.propTypes = {
  top: PropTypes.any,
  left: PropTypes.any,
  image: PropTypes.any,
  rotation: PropTypes.any,
  onDragEnd: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

export default KonvaImage;
