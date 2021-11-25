/**
 * create another canvas to invert the mask color
 * @param {*} image
 */
export const invertMask = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;

  for (let i = 0, n = data.length; i < n; i += 4) {
    data[i] = 0; // red
    data[i + 1] = 0; // green
    data[i + 2] = 0; // blue
    data[i + 3] = 255 - data[i + 3]; // alpha
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export const centerZoom = ({ container, oldZoom, newZoom, imageNode }) => {
  const containerWidth = container.width;
  const containerHeight = container.height;

  const mousePointTo = {
    x: containerWidth / 2 / oldZoom - imageNode.x() / oldZoom,
    y: containerHeight / 2 / oldZoom - imageNode.y() / oldZoom
  };

  const x = (containerWidth / 2 / newZoom - mousePointTo.x) * newZoom;
  const y = (containerHeight / 2 / newZoom - mousePointTo.y) * newZoom;

  return {
    x,
    y
  };
};

export const degToRad = (angle) => {
  return (angle / 180) * Math.PI;
};

export const getCenter = (shape) => {
  const angleRad = degToRad(shape.rotation || 0);
  return {
    x:
      shape.x +
      (shape.width / 2) * Math.cos(angleRad) +
      (shape.height / 2) * Math.sin(-angleRad),
    y:
      shape.y +
      (shape.height / 2) * Math.cos(angleRad) +
      (shape.width / 2) * Math.sin(angleRad)
  };
};

export const rotateAroundPoint = (shape, deltaDeg, point) => {
  const angleRad = degToRad(deltaDeg);
  const x = Math.round(
    point.x +
      (shape.x - point.x) * Math.cos(angleRad) -
      (shape.y - point.y) * Math.sin(angleRad)
  );
  const y = Math.round(
    point.y +
      (shape.x - point.x) * Math.sin(angleRad) +
      (shape.y - point.y) * Math.cos(angleRad)
  );
  return {
    ...shape,
    rotation: Math.round(shape.rotation + deltaDeg),
    x,
    y
  };
};

export const rotateAroundCenter = (shape, deltaDeg) => {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaDeg, center);
};
