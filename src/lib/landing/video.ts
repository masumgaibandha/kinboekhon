export interface VideoEmbed {
  provider: "youtube" | "facebook";
  embedUrl: string;
  // YouTube gives a still image; Facebook does not, so the page shows the hero or product image.
  thumbnail: string | null;
}

const YOUTUBE =
  /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/;
const FACEBOOK = /^https:\/\/(?:www\.|m\.|web\.)?(?:facebook\.com\/(?:[^/?#]+\/videos\/|watch\/?\?v=|reel\/)|fb\.watch\/)[^\s]+$/;

// A YouTube or Facebook video link as a privacy-friendly player URL, or null for any other link.
export function videoEmbed(url: string): VideoEmbed | null {
  const youtube = YOUTUBE.exec(url);
  if (youtube) {
    const id = youtube[1];
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (FACEBOOK.test(url)) {
    return {
      provider: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`,
      thumbnail: null,
    };
  }
  return null;
}
