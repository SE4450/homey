export const IMAGES = {
  HOMEY_BANNER: require("./image/13.png"),
};

export const THUMBNAILS: Record<number, any> = {
  1: require("./image/2.png"),
  2: require("./image/3.png"),
  3: require("./image/4.png"),
  4: require("./image/5.png"),
  5: require("./image/6.png"),
};

export const RANDOM_THUMBNAIL = () => {
  const rand = Math.floor(Math.random() * 5) + 1; // Adjusted to match the THUMBNAILS keys (1-5)
  return THUMBNAILS[rand];
};
