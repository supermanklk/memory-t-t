// SettingsPage.js

import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

const SettingsPage = ({ onSave }) => {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const [lock, setLock] = useState(false);
  const handleSave = () => {
    onSave({ width: parseInt(width), height: parseInt(height) });
  };
  const toggleFullscreen = () => {
    ipcRenderer.send('toggle-fullscreen');
  };

  const loadPage = () => {
    // Load the specified URL in the existing window
    const webviewContainer = document.getElementById('webviewContainer');
    const webview = document.createElement('webview');
    webview.src = 'https://www.baidu.com/?tn=28114124_1_dg';
    webview.style.width = '100px';
    webview.style.height = '100px';
    console.log('faith=============1');

    // 添加 'dom-ready' 事件监听器，等待 webview 内容准备就绪
    // webview.addEventListener('dom-ready', () => {
    //   console.log('faith=============dom-ready');
    //   // 内容准备就绪后，设置 webview 的宽度和高度
    //   webview.style.width = '800px';
    //   webview.style.height = '600px';
    // });

    // 使用 setTimeout 等待一小段时间再设置宽度和高度
    setTimeout(() => {
      console.log('faith=============2');
      webview.style.width = '800px';
      webview.style.height = '600px';
    }, 1000); // 设置合适的延迟时间，确保内容加载完成

    webviewContainer.appendChild(webview);
  };

  const lockScreen = () => {
    setLock(true);
    // 使用 JavaScript 获取 body 元素
    const bodyElement = document.querySelector('body');

    // 将 body 元素的 pointer-events 属性设置为 none
    bodyElement.style.pointerEvents = 'none';
  };

  const unlockScreen = () => {
    setLock(false);
    // 使用 JavaScript 获取 body 元素
    const bodyElement = document.querySelector('body');
    bodyElement.style.pointerEvents = 'auto';
  };

  return (
    <div>
      <h1>窗口大小设置({lock ? '锁屏中' : '激活状态'})</h1>
      <div>
        <label>
          宽度：
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          高度：
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleSave}>保存</button>
      <button onClick={toggleFullscreen}>Toggle Fullscreen</button>
      <button onClick={loadPage}>加载页面</button>
      <button onClick={lockScreen}>锁屏</button>
      <button style={{ pointerEvents: 'auto' }} onClick={unlockScreen}>
        解屏
      </button>
    </div>
  );
};

export default SettingsPage;
