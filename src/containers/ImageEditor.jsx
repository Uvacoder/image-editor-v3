import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";

import { Space } from "antd";
import mask from "../images2/mask-set-table.png";
import rotateLeftIcon from "../images2/icons/rotate-left.svg";
import rotateRightIcon from "../images2/icons/rotate-right.svg";
import Button from "../components/Button";
import Typography from "../components/Typography";
import { invertMask } from "../actions/images";
import KonvaImage from "./KonvaImage";

const USER_IMAGE_LAYER = {
  width: 544,
  height: 543
  // width: 1162,
  // height: 1155,
};

const MASK_LAYER = {
  width: 544,
  height: 543,
  // width: 1162,
  // height: 1155,
  left: 0,
  right: 0
};

/* eslint-disable react-hooks/exhaustive-deps */
const ImageEditor = ({ image }) => {
  const maskLayerRef = useRef(MASK_LAYER);
  const invertedMaskRef = useRef();
  const imageRef = useRef();
  const stageRef = useRef();

  const [imageMask] = useImage(mask, "Anonymous");

  const [values, setValues] = useState(() => ({
    ...USER_IMAGE_LAYER,
    rotation: 0
  }));
  const [zoom, setZoom] = useState(1);

  const maxZoomRef = useRef(1);
  const minZoomRef = useRef(1);
  const zoomStepRef = useRef(1);

  useEffect(() => {
    maskLayerRef.current = MASK_LAYER;
  });
  // get the mask of the current selected userImage layer if there is any
  useEffect(() => {
    if (!imageMask) return;
    maskLayerRef.current = imageMask;
  }, [imageMask]);

  const complete = !!imageMask?.complete;
  useMemo(() => {
    if (!imageMask) return;
    if (complete) {
      invertedMaskRef.current = invertMask(imageMask);
    }
  }, [complete, imageMask]);

  useEffect(() => {
    if (!image) return;
    const containerWidth = maskLayerRef.current
      ? maskLayerRef.current.width
      : USER_IMAGE_LAYER.width;
    const containerHeight = maskLayerRef.current
      ? maskLayerRef.current.height
      : USER_IMAGE_LAYER.height;

    const scaleX = containerWidth / image.naturalWidth;
    const scaleY = containerHeight / image.naturalHeight;

    if (scaleX > scaleY) {
      minZoomRef.current = scaleX;
      maxZoomRef.current = scaleX * 2;
      zoomStepRef.current = scaleX / 10;
    } else {
      minZoomRef.current = scaleY;
      maxZoomRef.current = scaleY * 2;
      zoomStepRef.current = scaleY / 10;
    }

    let scale;

    if (scaleX > scaleY) {
      scale = scaleX;
    } else {
      scale = scaleY;
    }

    setZoom(scale);
  }, [image, maskLayerRef]);

  const onRotateLeft = () => {
    setValues({
      ...values,
      rotation: values.rotation - 10
    });
  };

  // update automatically the values when the zoom is changing
  useEffect(() => {
    if (!image) return;
    setValues({
      ...values,
      imageWidth: Math.round(image.naturalWidth * zoom),
      imageHeight: Math.round(image.naturalHeight * zoom)
    });
  }, [zoom]);

  const onRotateRight = () => {
    setValues({
      ...values,
      rotation: values.rotation + 10
    });

    // onChange(rotation, 'rotation');
  };

  const onDragEnd = (e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());

    setValues({
      ...values,
      imageLeft: x,
      imageRight: y
    });

    // onChange(x, 'imageLeft');
    // onChange(y, 'imageTop');
  };

  // zoom on wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const oldScaleX = values.imageWidth / image.naturalWidth;
    const oldScaleY = values.imageHeight / image.naturalHeight;

    // wheel up = zoom+, wheel down = zoom-
    const scaleX =
      e.evt.deltaY < 0
        ? oldScaleX + zoomStepRef.current
        : oldScaleX - zoomStepRef.current;

    const scaleY =
      e.evt.deltaY < 0
        ? oldScaleY + zoomStepRef.current
        : oldScaleY - zoomStepRef.current;

    let ratio;

    if (scaleX > scaleY) {
      ratio = scaleX;
    } else {
      ratio = scaleY;
    }

    // limit the min and max zoom
    if (ratio < minZoomRef.current || ratio > maxZoomRef.current) return;
    setZoom(ratio);
  };

  const onZoomMinus = () => {
    const oldScaleX = values.imageWidth / image.naturalWidth;
    const oldScaleY = values.imageHeight / image.naturalHeight;
    const scaleX = oldScaleX - zoomStepRef.current;
    const scaleY = oldScaleY - zoomStepRef.current;

    let ratio;
    if (scaleX > scaleY) {
      ratio = scaleX;
    } else {
      ratio = scaleY;
    }

    // limit min zoom
    if (ratio < minZoomRef.current) return;
    setZoom((prev) => prev - zoomStepRef.current);
  };

  const onZoomPlus = () => {
    const oldScaleX = values.imageWidth / image.naturalWidth;
    const oldScaleY = values.imageHeight / image.naturalHeight;
    const scaleX = oldScaleX + zoomStepRef.current;
    const scaleY = oldScaleY + zoomStepRef.current;

    let ratio;
    if (scaleX > scaleY) {
      ratio = scaleX;
    } else {
      ratio = scaleY;
    }

    // limit max zoom
    if (ratio > maxZoomRef.current) return;

    setZoom((prev) => prev + zoomStepRef.current);
  };

  const onMouseEnter = (event) => {
    event.target.getStage().container().style.cursor = "move";
  };
  const onMouseLeave = (event) => {
    event.target.getStage().container().style.cursor = "default";
  };

  return (
    <div className="flexCenter stretchSelf">
      <div className="flexCenter">
        <Stage
          ref={stageRef}
          width={USER_IMAGE_LAYER.width}
          height={USER_IMAGE_LAYER.height}
          onWheel={handleWheel}
          x={0}
          y={0}
          style={maskLayerRef.current ? { backgroundColor: "#403B39" } : {}}
        >
          <Layer>
            {/* --------- user image ---------  */}
            <KonvaImage
              ref={imageRef}
              image={image}
              left={values.imageLeft}
              top={values.imageTop}
              onDragEnd={onDragEnd}
              zoom={zoom}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              rotation={values.rotation}
              container={maskLayerRef.current || USER_IMAGE_LAYER}
              zoomStepRef={zoomStepRef}
              imageWidth={values.imageWidth}
              imageHeight={values.imageHeight}
            />
            {/* --------- mask ---------  */}
            {maskLayerRef.current && (
              <Image
                image={invertedMaskRef.current}
                x={0}
                y={0}
                width={maskLayerRef.current.width}
                height={maskLayerRef.current.height}
                globalCompositeOperation="normal"
                opacity={0.7}
                listening={false} // equivalent to pointer events: none
                alt="mask"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <div className="flexCenter stretchSelf">
        <Space className="flexCenter" size={30}>
          <div className="flexColumn">
            <div className="m-b-5 stretchSelf flexCenter">
              <Typography>Zoom</Typography>
            </div>
            <Space>
              <Button onClick={onZoomMinus}>-</Button>
              <Button onClick={onZoomPlus}>+</Button>
            </Space>
            {/* <Slider
              step={zoomStepRef.current}
              onChange={onZoomButton}
              defaultValue={minZoomRef.current}
              value={zoom}
              min={minZoomRef.current}
              max={maxZoomRef.current}
              tooltipVisible={false}
            /> */}
          </div>
          {/* ------- rotation -------  */}
          <div className="flexColumn">
            <div className="m-b-10 m-t-20 stretchSelf flexCenter">
              <Typography>Rotation</Typography>
            </div>
            <Space size={40}>
              <button
                onClick={onRotateLeft}
                className="clickableText"
                type="button"
              >
                <img alt="rotate left" src={rotateLeftIcon} />
              </button>
              <button
                onClick={onRotateRight}
                className="clickableText"
                type="button"
              >
                <img alt="rotate right" src={rotateRightIcon} />
              </button>
            </Space>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default ImageEditor;
