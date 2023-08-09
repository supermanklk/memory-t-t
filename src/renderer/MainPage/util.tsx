export const createIframe = (url: string) => {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  // 将 iframe 添加到指定的父容器中
  const iframeContainer: any = document.getElementById('iframeContainer');
  // 设置 iframeContainer 的样式
  iframeContainer.style.position = 'absolute';
  iframeContainer.style.width = '100vw';
  iframeContainer.style.height = '100vh';
  iframeContainer.style.background = 'black';
  iframeContainer.appendChild(iframe);
};

export const removeIframe = () => {
  const iframeContainer = document.getElementById('iframeContainer');
  if (iframeContainer) {
    const iframe = iframeContainer.querySelector('iframe');
    if (iframe) {
      iframeContainer.removeChild(iframe);
    }
    // 移除 iframeContainer 的样式
    iframeContainer.style.position = '';
    iframeContainer.style.width = '';
    iframeContainer.style.height = '';
    iframeContainer.style.background = '';
  }
};

export const reloadIframe = (url: string) => {
  removeIframe(); // 先移除旧的 iframe

  // 创建并添加新的 iframe
  createIframe(url);
};

export const unlockScreen = () => {
  const bodyElement: any = document.querySelector('body');
  bodyElement.style.pointerEvents = 'auto';
};

export const lockScreen = () => {
  const bodyElement: any = document.querySelector('body');
  bodyElement.style.pointerEvents = 'none';
};
