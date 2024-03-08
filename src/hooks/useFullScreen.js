import { useState } from 'react';

export default function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullScreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullScreen(false);
          })
          .catch((err) => {
            console.error(
              `Error attempting to exit full-screen mode: ${err.message}`
            );
          });
      }
    }
  };

  return { isFullScreen, handleFullScreenToggle };
}
