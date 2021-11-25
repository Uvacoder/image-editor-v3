import { forwardRef, useEffect, useRef, useState } from "react";

import PropTypes from "prop-types";
import { Image } from "react-konva";
import { centerZoom } from "../actions/images";

/* eslint-disable react/display-name */
/* eslint-disable max-len */
const KonvaImage = forwardRef(
  (
    {
      zoom,
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
    const originLeftRef = useRef(0);
    const originTopRef = useRef(0);

    const [position, setPosition] = useState({ left, top });

    useEffect(() => {
      if (!image) return;
      const imageNode = ref.current;
      const oldScaleX = imageNode.width() / image.naturalWidth;
      const oldScaleY = imageNode.height() / image.naturalHeight;

      let oldZoom;
      if (oldScaleX > oldScaleY) {
        oldZoom = oldScaleX;
      } else {
        oldZoom = oldScaleY;
      }

      const { x, y } = centerZoom({
        container,
        oldZoom,
        newZoom: zoom,
        imageNode
      });

      setPosition({ left: x, top: y });

      // console.log('y', y)
      // console.log('x', x)
      // originLeftRef.current *= -x;
      // originTopRef.current *= -y;
    }, [zoom, ref, image, container]);

    useEffect(() => {
      originLeftRef.current = container.width / 2;
      originTopRef.current = container.height / 2;
    }, [container, rotation]);

    return (
      <Image
        ref={ref}
        image={image}
        offsetX={originLeftRef.current}
        offsetY={originTopRef.current}
        // with offset, the image is translated at { -container.width/2, -container.height/2 } in the parent stage
        // so need to re-translate it to { container.width/2, container.height/2 }
        // see: https://konvajs.org/docs/posts/Position_vs_Offset.html
        // the zoom shift the position to left and top, so need to adjust it to center the image
        x={originLeftRef.current}
        y={originTopRef.current}
        draggable
        onDragEnd={onDragEnd}
        width={imageWidth}
        height={imageHeight}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        alt="user"
        // the new origin  is the center of the container
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
