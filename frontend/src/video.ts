export const startVideo = async (localVideo) => {
  try {
    // カメラの映像を取得
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // 映像をvideo要素にセットして再生
    localVideo.srcObject = localStream;
    localVideo.play();
    localVideo.volume = 0;
    return localStream;
  } catch (error) {
    console.error("mediaDevice.getUserMedia() error:", error);
    return;
  }
};

export const stopVideo = (localVideo) => {
  localVideo.srcObject = null;
  localVideo.stop();
};
