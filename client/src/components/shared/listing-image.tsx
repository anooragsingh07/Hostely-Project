"use client";

import Image from "next/image";

const CLOUDINARY_HOST = /(^|\.)cloudinary\.com$/i;

const canUseNextImage = (src: string): boolean => {
  try {
    const u = new URL(src);
    return u.protocol === "https:" && CLOUDINARY_HOST.test(u.hostname);
  } catch {
    return false;
  }
};

interface ListingImageProps {
  src: string;
  alt: string;
  className?: string;
  /** When true, eagerly loads the hero image (detail page LCP). */
  priority?: boolean;
}

/**
 * Uses `next/image` for Cloudinary URLs (resize + modern formats). Other
 * hosts fall back to a lazy `<img>` so arbitrary seller URLs still work
 * without expanding `remotePatterns` to the whole public internet.
 */
export const ListingImage = ({ src, alt, className, priority }: ListingImageProps) => {
  if (canUseNextImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
    />
  );
};
