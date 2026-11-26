const profiles = {
  thumbnail: [160, 320],
  card: [320, 640, 960],
  gallery: [480, 768, 960],
};

export function cloudinaryImage(src, profile, sizes) {
  // Uploads use versioned delivery URLs. Leave signed or already transformed URLs alone.
  const match = typeof src === "string" && src.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/,
  );
  if (!match) return { src: src || undefined };

  const widths = profiles[profile];
  const url = (width) => `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}`;

  return {
    src: url(widths[0]),
    srcSet: widths.map((width) => `${url(width)} ${width}w`).join(", "),
    sizes,
  };
}
